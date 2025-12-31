import type { VerdictCode, CTA } from "./types";

// 항상 3개의 CTA 반환
export function buildCtas(code: VerdictCode): CTA[] {
  return [
    {
      title: "관계 변화 후 재분석 리포트",
      body: "상황이 바뀌었을 때 다시 계산합니다.",
      price: 7900,
      sku: "RECHECK_14D",
    },
    {
      title: "연락 리스크 분석",
      body: "지금 이 문장, 보내도 될까?",
      price: 5900,
      sku: "TEXT_RISK",
    },
    {
      title: "재회 가능성 시뮬레이션",
      body: "이 행동을 하면 관계는 어떻게 변할까?",
      price: 9900,
      sku: "SIMULATION",
    },
  ];
}

