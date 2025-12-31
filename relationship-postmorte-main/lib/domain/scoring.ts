import type { ChecklistAnswers, StructuredAnswers, Scores } from "./types";

type ItemSpec = {
  qid: string;
  weight: number;
  reverse?: boolean;
};

// A: 애착 반응 / 개인 성향 (8문항: q1-q8)
const A_ITEMS: ItemSpec[] = [
  { qid: "q1", weight: 1 },
  { qid: "q2", weight: 1 },
  { qid: "q3", weight: 1 },
  { qid: "q4", weight: 1 },
  { qid: "q5", weight: 1 },
  { qid: "q6", weight: 1 },
  { qid: "q7", weight: 1 },
  { qid: "q8", weight: 1 },
];

// B: 상대의 관계 투자 (9문항: q9-q17)
const B_ITEMS: ItemSpec[] = [
  { qid: "q9", weight: 1 },
  { qid: "q10", weight: 1 },
  { qid: "q11", weight: 1 },
  { qid: "q12", weight: 1 },
  { qid: "q13", weight: 1 },
  { qid: "q14", weight: 1 },
  { qid: "q15", weight: 1 },
  { qid: "q16", weight: 1 },
  { qid: "q17", weight: 1 },
];

// C: 상호성 / 권력 구조 (8문항: q18-q25)
const C_ITEMS: ItemSpec[] = [
  { qid: "q18", weight: 1 },
  { qid: "q19", weight: 1 },
  { qid: "q20", weight: 1 },
  { qid: "q21", weight: 1 },
  { qid: "q22", weight: 1 },
  { qid: "q23", weight: 1 },
  { qid: "q24", weight: 1 },
  { qid: "q25", weight: 1 },
];

function normalizeTo100(raw: number, minRaw: number, maxRaw: number): number {
  const v = (raw - minRaw) / (maxRaw - minRaw);
  return Math.max(0, Math.min(100, Math.round(v * 100)));
}

function scoreBucket(answers: ChecklistAnswers, items: ItemSpec[]): number {
  let raw = 0;
  let minRaw = 0;
  let maxRaw = 0;

  for (const it of items) {
    const a = answers[it.qid] || 3; // 기본값 3 (중간)
    // reverse: 1↔5, 2↔4, 3↔3
    const val = it.reverse ? 6 - a : a;
    raw += val * it.weight;
    minRaw += 1 * it.weight;
    maxRaw += 5 * it.weight;
  }
  return normalizeTo100(raw, minRaw, maxRaw);
}

// 강제 구조 질문 보정치 계산
function getModifiers(structured: StructuredAnswers): { bMod: number; cMod: number } {
  let bMod = 0;
  let cMod = 0;

  // Q1: 마지막 상호작용 방식
  if (structured.last_interaction_type === "A") bMod -= 10;
  if (structured.last_interaction_type === "B") bMod -= 20;
  if (structured.last_interaction_type === "C") bMod -= 15;
  if (structured.last_interaction_type === "D") bMod += 10;

  // Q2: 연락 주도
  if (structured.contact_initiation === "A") cMod -= 20;
  if (structured.contact_initiation === "B") cMod += 10;
  if (structured.contact_initiation === "C") cMod += 15;
  if (structured.contact_initiation === "D") cMod -= 15;

  // Q3: 상대 상태
  if (structured.partner_state === "A") {
    bMod -= 10;
    cMod -= 10;
  }
  if (structured.partner_state === "C") {
    bMod += 10;
    cMod += 10;
  }
  if (structured.partner_state === "D") {
    bMod -= 25;
    cMod -= 25;
  }

  return { bMod, cMod };
}

export function computeScores(
  checklist: ChecklistAnswers,
  structured: StructuredAnswers
): Scores {
  // 기본 점수 계산
  const A = scoreBucket(checklist, A_ITEMS);
  const rawB = scoreBucket(checklist, B_ITEMS);
  const rawC = scoreBucket(checklist, C_ITEMS);

  // 보정치 적용
  const { bMod, cMod } = getModifiers(structured);
  const B = Math.max(0, Math.min(100, rawB + bMod));
  const C = Math.max(0, Math.min(100, rawC + cMod));

  // R, G 계산
  const R = Math.round((B + C) / 2);
  const G = A - R;

  return { A, B, C, R, G };
}

// 개별 점수 계산 함수들 (호환성을 위해)
export function computeABC(checklist: ChecklistAnswers): { A: number; B: number; C: number } {
  const A = scoreBucket(checklist, A_ITEMS);
  const B = scoreBucket(checklist, B_ITEMS);
  const C = scoreBucket(checklist, C_ITEMS);
  return { A, B, C };
}

export function computeRG(A: number, B: number, C: number): { R: number; G: number } {
  const R = Math.round((B + C) / 2);
  const G = A - R;
  return { R, G };
}

