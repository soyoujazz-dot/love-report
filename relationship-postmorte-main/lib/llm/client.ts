import OpenAI from "openai";
import {
  SYSTEM_PROMPT,
  DEV_INSTRUCTIONS,
  buildUserPrompt,
  NARRATIVE_JSON_SCHEMA,
} from "./prompts";
import type { Scores, Verdict, StructuredAnswers, Narrative } from "../domain/types";

// OpenAI 클라이언트 초기화
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
}

// 기본 narrative (GPT 호출 실패 시 fallback)
function getDefaultNarrative(
  scores: Scores,
  verdict: Verdict,
  evidencePoints: string[]
): Narrative {
  return {
    why_this_verdict: `애착 반응 지수(${scores.A})와 관계 현실 지수(${scores.R}) 사이의 ${
      scores.G >= 0 ? "양의" : "음의"
    } 격차(${scores.G})가 현재 관계 상태를 결정짓는 핵심 요인입니다. 행동 지표 기준으로 ${verdict.headline.split(".")[0]}입니다.`,
    your_state:
      scores.A >= 60
        ? "현재 감정 반응이 실제 관계 상황보다 앞서 활성화된 상태입니다."
        : "감정 반응은 비교적 안정적이나, 관계 현실에 대한 객관적 판단이 필요한 시점입니다.",
    partner_state:
      scores.R < 50
        ? "상대는 관계에서 심리적 거리를 두는 방향을 선택한 상태로 보입니다."
        : "상대의 관계 참여 신호가 아직 완전히 소멸되지 않은 상태입니다.",
    evidence_points:
      evidencePoints.length > 0
        ? evidencePoints
        : [
            "입력된 상황에서 반복되는 불안 패턴이 감지됩니다",
            "상대의 반응 변화에 대한 민감성이 높아진 상태입니다",
          ],
  };
}

export async function generateNarrative(args: {
  user_text: string;
  structured: StructuredAnswers;
  scores: Scores;
  verdict: Verdict;
  evidence_points: string[];
}): Promise<Narrative> {
  try {
    const client = getOpenAIClient();
    const userPrompt = buildUserPrompt(args);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\n${DEV_INSTRUCTIONS}`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "narrative_response",
          strict: true,
          schema: NARRATIVE_JSON_SCHEMA,
        },
      },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("Empty response from OpenAI, using fallback");
      return getDefaultNarrative(args.scores, args.verdict, args.evidence_points);
    }

    const parsed = JSON.parse(content) as Narrative;

    // 응답 검증
    if (
      !parsed.why_this_verdict ||
      !parsed.your_state ||
      !parsed.partner_state ||
      !Array.isArray(parsed.evidence_points)
    ) {
      console.warn("Invalid response structure from OpenAI, using fallback");
      return getDefaultNarrative(args.scores, args.verdict, args.evidence_points);
    }

    return parsed;
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback: GPT 없이도 기본 응답 제공
    return getDefaultNarrative(args.scores, args.verdict, args.evidence_points);
  }
}

// 연락 문장 위험도 분석 (유료 기능용)
export async function analyzeContactRisk(args: {
  proposed_message: string;
  scores: Scores;
  verdict: Verdict;
}): Promise<{
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risk_score: number;
  analysis: string;
  suggested_revision: string | null;
}> {
  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}

You are analyzing a proposed contact message for relationship risk.
Based on the current relationship state and scores, evaluate:
1. How this message might be received
2. Risk of pushing partner further away
3. Power dynamic implications

Return JSON with: risk_level, risk_score (0-100), analysis (Korean), suggested_revision (Korean, null if message is fine)`,
        },
        {
          role: "user",
          content: `Current relationship state:
- Verdict: ${args.verdict.code}
- Scores: A=${args.scores.A}, B=${args.scores.B}, C=${args.scores.C}, R=${args.scores.R}, G=${args.scores.G}

Proposed message to send:
"${args.proposed_message}"

Analyze the risk of sending this message.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Contact risk analysis error:", error);
    // Fallback
    return {
      risk_level: "MEDIUM",
      risk_score: 50,
      analysis: "분석 중 오류가 발생했습니다. 신중하게 판단해주세요.",
      suggested_revision: null,
    };
  }
}

