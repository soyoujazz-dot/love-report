import type { Scores, Verdict, StructuredAnswers } from "../domain/types";

// 시스템 프롬프트 (GPT를 판정자로 설정)
export const SYSTEM_PROMPT = `You are a relationship diagnostic engine, not a counselor.
Your role is to analyze relationship situations using psychology-based structural reasoning.

You must:
- Base conclusions on provided scores and behavioral data
- Separate personal attachment traits from relationship reality
- Deliver a clear, decisive judgment
- Avoid emotional reassurance unless it supports the diagnosis
- Never give false hope or encouragement

You are NOT allowed to:
- Provide generic relationship advice
- Overemphasize empathy
- Say "it depends" without a clear conclusion
- Attribute results to fate, luck, or destiny

Your tone must be:
- Calm
- Analytical
- Authoritative
- Clear and structured

CRITICAL RULES:
- Write all output in Korean
- Do NOT use hopeful language
- Do NOT use vague expressions
- Do NOT ask questions
- Use expressions like "현재 구조에서는", "행동 지표 기준으로", "이 시점에서는"
- NEVER say "당신은 이런 사람입니다" - instead say "이번 관계 구조에서는 이렇다"`;

// 개발자 지침 (verdict 고정)
export const DEV_INSTRUCTIONS = `You are a relationship diagnostic report writer.
You MUST NOT change the verdict or recommendation provided.
Your job is to:
- Explain WHY the verdict was reached (scores + evidence labels)
- Personalize using the user's situation text WITHOUT quoting it verbatim
- Write concise, authoritative Korean
- Avoid hopeful language and avoid "it depends"

Return JSON that matches the required schema exactly.

Reminder:
This analysis is based on reported behavior and current relational data.
It does not assess personality worth, emotional value, or future destiny.`;

// 구조 질문 라벨 변환
function getStructuredLabel(key: keyof StructuredAnswers, value: string): string {
  const labels: Record<string, Record<string, string>> = {
    last_interaction_type: {
      A: "감정 대화 중단",
      B: "상대의 일방적 종료",
      C: "내가 더 설명하려다 끝남",
      D: "명확한 합의 종료",
    },
    contact_initiation: {
      A: "거의 내가 주도",
      B: "비슷",
      C: "거의 상대가 주도",
      D: "연락 거의 없음",
    },
    partner_state: {
      A: "회피/거리두기",
      B: "혼란",
      C: "감정 표현 있음",
      D: "완전 단절",
    },
  };
  return labels[key]?.[value] || value;
}

// 사용자 입력 프롬프트 구성
export function buildUserPrompt(payload: {
  user_text: string;
  structured: StructuredAnswers;
  scores: Scores;
  verdict: Verdict;
  evidence_points: string[];
}): string {
  const structuredLabels = {
    last_interaction_type: getStructuredLabel("last_interaction_type", payload.structured.last_interaction_type),
    contact_initiation: getStructuredLabel("contact_initiation", payload.structured.contact_initiation),
    partner_state: getStructuredLabel("partner_state", payload.structured.partner_state),
  };

  return `Analyze the relationship and generate a personalized report.

[User Situation Text - Actively integrate specific keywords, unique expressions, or short phrases from the user's text. Use these direct quotes to "anchor" your analysis, proving that you have deeply understood their specific situation.]
${payload.user_text}

[Structured Relationship Indicators]
- Last meaningful interaction ended as: ${structuredLabels.last_interaction_type}
- Contact initiation pattern: ${structuredLabels.contact_initiation}
- Current partner state: ${structuredLabels.partner_state}

[Psychological Scores]
- Attachment Reaction Index (A): ${payload.scores.A}
- Relationship Investment Index (B): ${payload.scores.B}
- Reciprocity / Power Balance Index (C): ${payload.scores.C}
- Relationship Reality Index (R): ${payload.scores.R}
- Emotion-Reality Gap (G): ${payload.scores.G}

[Fixed Verdict - DO NOT CHANGE THIS]
Code: ${payload.verdict.code}
Headline: ${payload.verdict.headline}
Risk Statement: ${payload.verdict.risk_statement}
Recommendation: ${payload.verdict.recommendation}
Do Not List: ${payload.verdict.do_not_list.join(", ")}
Reanalysis Triggers: ${payload.verdict.reanalysis_triggers.join(", ")}

[Evidence Labels (derived from user text)]
${payload.evidence_points.length > 0 ? payload.evidence_points.join(", ") : "No specific patterns detected"}

Analysis rules:
1. Treat A (Attachment) as personal reaction tendency, not as the cause.
2. Treat B and C as behavioral reality.
3. Base final judgment primarily on R and G.
4. If A and R are misaligned, explicitly explain the mismatch.
5. The verdict is ALREADY DECIDED - you are explaining WHY, not deciding.

Generate a JSON response with EXACTLY this structure:
{
  "why_this_verdict": "2-3 sentences explaining why this verdict was reached based on scores, in Korean",
  "your_state": "1-2 sentences describing the user's current emotional/behavioral state, in Korean",
  "partner_state": "1-2 sentences describing the partner's psychological position, in Korean",
  "evidence_points": ["array of 2-4 rephrased observations from user text, in Korean - NOT direct quotes"]
}

Important:
- All text must be in Korean
- Do NOT quote user's text directly - rephrase the meaning
- Keep it concise and authoritative
- No hopeful language`;
}

// JSON 스키마 (Structured Output용)
export const NARRATIVE_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    why_this_verdict: {
      type: "string",
      description: "판정 이유 설명 (2-3문장, 한국어)",
    },
    your_state: {
      type: "string",
      description: "사용자의 현재 감정/행동 상태 (1-2문장, 한국어)",
    },
    partner_state: {
      type: "string",
      description: "상대의 심리적 위치 해석 (1-2문장, 한국어)",
    },
    evidence_points: {
      type: "array",
      items: { type: "string" },
      description: "사용자 텍스트에서 추출한 관찰 포인트 (2-4개, 의미만 재구성)",
    },
  },
  required: ["why_this_verdict", "your_state", "partner_state", "evidence_points"],
  additionalProperties: false,
};

