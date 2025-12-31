// 강제 구조 질문 응답
export type StructuredAnswer = "A" | "B" | "C" | "D";

export type StructuredAnswers = {
  last_interaction_type: StructuredAnswer;
  contact_initiation: StructuredAnswer;
  partner_state: StructuredAnswer;
};

// 체크리스트 응답 (q1..q25)
export type ChecklistAnswers = Record<string, 1 | 2 | 3 | 4 | 5>;

// 리포트 요청
export type ReportRequest = {
  user_text: string;
  structured: StructuredAnswers;
  checklist: ChecklistAnswers;
};

// 점수
export type Scores = {
  A: number;
  B: number;
  C: number;
  R: number;
  G: number;
};

// 판정 코드
export type VerdictCode =
  | "ANXIETY_ONLY"         // 내 불안
  | "PARTNER_WITHDRAWAL"   // 상대 이탈
  | "COMPOUND_CRISIS"      // 복합 위기
  | "WAIT_AND_OBSERVE"     // 관망
  | "REUNION_CONSIDERABLE"; // 재회 검토 가능

// 판정 결과
export type Verdict = {
  code: VerdictCode;
  headline: string;
  risk_statement: string;
  recommendation: string;
  do_not_list: string[];
  reanalysis_triggers: string[];
};

// GPT가 생성하는 내러티브
export type Narrative = {
  why_this_verdict: string;
  your_state: string;
  partner_state: string;
  evidence_points: string[];
};

// CTA
export type CTA = {
  title: string;
  body: string;
  price: number;
  sku: string;
};

// 최종 리포트 응답
export type ReportResponse = {
  scores: Scores;
  verdict: Verdict;
  narrative: Narrative;
  ctas: CTA[];
};

