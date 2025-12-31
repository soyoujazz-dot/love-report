type Pattern = {
  key: string;
  keywords: string[];
  label: string;
};

const PATTERNS: Pattern[] = [
  {
    key: "fear_of_silence",
    keywords: ["답장", "읽씹", "연락없", "잠수", "왜 안", "안 읽", "씹"],
    label: "침묵을 거절로 해석하는 불안",
  },
  {
    key: "need_closure",
    keywords: ["정리", "확실", "결론", "대답해", "왜 그랬", "이유", "설명"],
    label: "명확한 결론/해명 욕구",
  },
  {
    key: "self_blame",
    keywords: ["내가 잘못", "내 탓", "예민", "미안", "내 잘못", "내가 문제"],
    label: "자기비난/과책임",
  },
  {
    key: "chasing",
    keywords: ["붙잡", "잡고싶", "전화", "마지막", "한번만", "기회"],
    label: "즉시 접촉 충동",
  },
  {
    key: "obsessive_thinking",
    keywords: ["계속 생각", "머리에서", "잊혀지지", "떠오르", "잠이 안"],
    label: "반추적 사고 패턴",
  },
  {
    key: "hope_seeking",
    keywords: ["가능성", "기회", "아직", "혹시", "다시", "돌아올"],
    label: "희망 추구 경향",
  },
  {
    key: "partner_avoidance",
    keywords: ["피하", "거리", "차갑", "냉담", "무시", "회피"],
    label: "상대의 회피 신호 인식",
  },
  {
    key: "emotional_exhaustion",
    keywords: ["지쳤", "피곤", "힘들", "못하겠", "더이상"],
    label: "감정적 소진 상태",
  },
];

export function extractEvidencePoints(userText: string): string[] {
  const t = userText.replace(/\s+/g, " ").toLowerCase();
  const found: string[] = [];

  for (const p of PATTERNS) {
    if (p.keywords.some((k) => t.includes(k.toLowerCase()))) {
      found.push(p.label);
    }
  }

  // 최대 4개만 반환 (중복 제거)
  return [...new Set(found)].slice(0, 4);
}

// 민감정보 마스킹 (전화번호, 이름 등)
export function redactSensitiveInfo(text: string): string {
  // 전화번호 마스킹
  let redacted = text.replace(
    /(\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4})/g,
    "[전화번호]"
  );

  // 이메일 마스킹
  redacted = redacted.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[이메일]"
  );

  return redacted;
}

