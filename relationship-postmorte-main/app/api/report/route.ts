import { NextResponse } from "next/server";
import { z } from "zod";
import { computeScores } from "@/lib/domain/scoring";
import { decide } from "@/lib/domain/decision";
import { extractEvidencePoints, redactSensitiveInfo } from "@/lib/domain/evidence";
import { buildCtas } from "@/lib/domain/cta";
import { generateNarrative } from "@/lib/llm/client";
import type { ReportResponse, StructuredAnswers, ChecklistAnswers } from "@/lib/domain/types";

// 입력 검증 스키마
const StructuredAnswerSchema = z.enum(["A", "B", "C", "D"]);
const LikertSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

const ReportRequestSchema = z.object({
  user_text: z.string().min(10, "상황 설명은 최소 10자 이상이어야 합니다."),
  structured: z.object({
    last_interaction_type: StructuredAnswerSchema,
    contact_initiation: StructuredAnswerSchema,
    partner_state: StructuredAnswerSchema,
  }),
  checklist: z.record(z.string(), LikertSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 입력 검증
    const parseResult = ReportRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "입력 데이터가 올바르지 않습니다.", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { user_text, structured, checklist } = parseResult.data;

    // 민감정보 마스킹
    const sanitizedText = redactSensitiveInfo(user_text);

    // 1) 점수 계산
    const scores = computeScores(
      checklist as ChecklistAnswers,
      structured as StructuredAnswers
    );

    // 2) 판정(결론) 확정 - 코드가 결정, GPT가 바꿀 수 없음
    const verdict = decide(scores.A, scores.B, scores.C);

    // 3) 증거 포인트 추출
    const evidence_points = extractEvidencePoints(sanitizedText);

    // 4) GPT는 "설명/문장화"만 담당
    const narrative = await generateNarrative({
      user_text: sanitizedText,
      structured: structured as StructuredAnswers,
      scores,
      verdict,
      evidence_points,
    });

    // 5) CTA는 verdict.code 기반으로 서버에서 고정 추천
    const ctas = buildCtas(verdict.code);

    // 최종 응답
    const response: ReportResponse = {
      scores,
      verdict,
      narrative,
      ctas,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// 연락 문장 리스크 분석 API (별도 엔드포인트로 분리 가능)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { proposed_message, scores, verdict } = body;

    if (!proposed_message || !scores || !verdict) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 연락 문장 리스크 분석은 별도 import 필요
    const { analyzeContactRisk } = await import("@/lib/llm/client");
    const result = await analyzeContactRisk({ proposed_message, scores, verdict });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Contact risk analysis error:", error);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

