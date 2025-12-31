import type { VerdictCode, Verdict } from "./types";

export function decide(A: number, B: number, C: number): Verdict {
  const R = Math.round((B + C) / 2);
  const G = A - R;

  // CASE 1: 내 불안 (A >= 60 && R >= 60 && G >= 20)
  if (A >= 60 && R >= 60 && G >= 20) {
    return {
      code: "ANXIETY_ONLY",
      headline:
        "현재 관계 현실은 급격히 붕괴하지 않았고, 감정 반응이 앞서 있습니다.",
      risk_statement:
        "지금의 즉흥적 접촉은 '불안을 줄이려는 행동'이 되어 관계를 더 불안정하게 만들 수 있습니다.",
      recommendation:
        "연락/확인 행동을 멈추고 72시간 감정 안정 루틴을 먼저 실행하세요.",
      do_not_list: [
        "장문의 감정 설명/해명",
        "반복 연락·추궁",
        "SNS로 반응 유도",
      ],
      reanalysis_triggers: [
        "상대가 먼저 연락을 재개",
        "대화 주도권이 균형으로 회복",
        "감정 표현 신호가 명확히 발생",
      ],
    };
  }

  // CASE 2: 상대 이탈 (A <= 40 && R < 40)
  if (A <= 40 && R < 40) {
    return {
      code: "PARTNER_WITHDRAWAL",
      headline:
        "당신의 반응 성향보다 '상대의 실제 이탈 신호'가 핵심 변수입니다.",
      risk_statement:
        "지금 붙잡는 행동은 권력 비대칭을 키워 재회 가능성을 더 낮출 수 있습니다.",
      recommendation:
        "관계 정지(노컨택)로 손해를 막고, 상대의 '자발적 행동 변화'만 관찰하세요.",
      do_not_list: [
        "이유 캐묻기/설득",
        "합의 없는 만남 요청",
        "사과·선물로 거래 시도",
      ],
      reanalysis_triggers: [
        "상대가 일정/만남을 먼저 제안",
        "대화에서 감정·관계 언급이 재등장",
        "연락 패턴이 1~2주간 안정적으로 회복",
      ],
    };
  }

  // CASE 3: 복합 위기 (A >= 60 && R < 40)
  if (A >= 60 && R < 40) {
    return {
      code: "COMPOUND_CRISIS",
      headline:
        "불안 반응과 관계 이탈이 동시에 진행되는 '복합 위기' 상태입니다.",
      risk_statement:
        "지금의 접촉은 회피/거리두기 반응을 강화할 가능성이 큽니다.",
      recommendation:
        "즉시 접촉을 끊고, 14일 '재균형 기간' 후 재분석을 권장합니다.",
      do_not_list: [
        "감정 폭발형 연락",
        "확답 요구",
        "차단/해제 반복으로 압박",
      ],
      reanalysis_triggers: [
        "상대가 주도적으로 대화 재개",
        "연락 비율이 균형(6:4 내외)로 이동",
        "갈등 주제가 아닌 일상 대화가 3회 이상 지속",
      ],
    };
  }

  // CASE 4: 관망 (A 40-59 && R 40-59)
  if (A >= 40 && A <= 59 && R >= 40 && R <= 59) {
    return {
      code: "WAIT_AND_OBSERVE",
      headline:
        "끝났다고 단정하기도, 재회를 밀어붙이기도 위험한 '관망 구간'입니다.",
      risk_statement:
        "지금 개입하면 결과가 악화될 확률이 높고, 관망하면 정보가 쌓입니다.",
      recommendation: "7일간 '관찰' 후, 상대 반응 데이터로 재계산하세요.",
      do_not_list: [
        "감정 논쟁 재점화",
        "연속적인 확인 연락",
        "상대 주변인 접촉",
      ],
      reanalysis_triggers: [
        "상대 반응 속도/빈도 변화",
        "만남/통화 제안 여부",
        "SNS 신호의 지속적 패턴",
      ],
    };
  }

  // CASE 5: 재회 검토 가능 (default)
  return {
    code: "REUNION_CONSIDERABLE",
    headline:
      "감정과 관계 현실이 비교적 안정적이어서 '조건부 재회 시도'가 가능한 구간입니다.",
    risk_statement:
      "다만 방식이 틀리면 권력 비대칭이 생겨 급격히 무너질 수 있습니다.",
    recommendation:
      "연락은 '가벼운 확인 1회'로 시작하고 반응 데이터로 다음 행동을 결정하세요.",
    do_not_list: ["장문 감정 고백", "관계 정의 요구", "즉시 만남 강요"],
    reanalysis_triggers: [
      "상대가 대화·만남을 주도",
      "감정/관계 언급이 자연스럽게 등장",
      "연락 흐름이 2주 이상 안정 유지",
    ],
  };
}

