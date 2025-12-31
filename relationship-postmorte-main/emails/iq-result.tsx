import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface AnalysisResultEmailProps {
  resultType: string
  attachmentScore: number // A: 애착 반응
  emotionScore: number    // B: 관계 투자
  conflictScore: number   // C: 상호성
  cognitiveScore: number  // R: 관계 현실
  selfScore: number       // G: 갭
  situationSummary: string
}

export default function AnalysisResultEmail({
  resultType = "감정 비대칭",
  attachmentScore = 65,  // A
  emotionScore = 42,     // B
  conflictScore = 38,    // C
  cognitiveScore = 40,   // R
  selfScore = 25,        // G
  situationSummary = "",
}: AnalysisResultEmailProps) {
  
  const getTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      "복합 위기": "감정 반응은 높지만, 상대의 관계 투자와 상호성은 이미 크게 감소한 상태입니다.",
      "상대 이탈": "상대가 관계에서 이미 이탈한 상태로, 현재 접촉은 회피를 강화할 가능성이 높습니다.",
      "내 불안 주도": "관계 자체는 유지되고 있으나, 당신의 불안 반응이 관계를 압박하고 있습니다.",
      "회복 가능 구간": "감정 조절과 전략적 거리두기로 관계 회복 가능성이 있는 상태입니다.",
      "감정 비대칭": "당신의 감정 투자와 상대의 반응 사이에 불균형이 존재합니다.",
    }
    return descriptions[type] || descriptions["감정 비대칭"]
  }

  const getActionAdvice = (type: string) => {
    if (type === "복합 위기" || type === "상대 이탈") {
      return "연락 중단 + 감정 안정 기간 확보"
    }
    if (type === "내 불안 주도") {
      return "불안 반응 조절 + 거리두기 연습"
    }
    if (type === "회복 가능 구간") {
      return "전략적 거리두기 유지"
    }
    return "현실 기반 판단 + 감정 분리"
  }

  return (
    <Html>
      <Head />
      <Preview>관계 진단 결과: {resultType}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🔍 관계진단리포트</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>관계 진단 결과</Heading>
            
            {/* Result Type Card */}
            <Section style={verdictCard}>
              <Text style={verdictLabel}>현재 이 관계는</Text>
              <Text style={verdictValue}>'{resultType}' 상태입니다</Text>
              <Text style={descriptionText}>{getTypeDescription(resultType)}</Text>
            </Section>

            <Hr style={hr} />

            {/* Score Summary */}
            <Section>
              <Text style={sectionTitle}>📊 점수 분석</Text>
              
              <table style={scoreTable} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={scoreRow}>
                      <Text style={scoreName}>애착 반응 지수 (A)</Text>
                      <Text style={scoreValue}>{attachmentScore}/100</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={scoreRowAlt}>
                      <Text style={scoreName}>관계 투자 지수 (B)</Text>
                      <Text style={scoreValue}>{emotionScore}/100</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={scoreRow}>
                      <Text style={scoreName}>상호성 지수 (C)</Text>
                      <Text style={scoreValue}>{conflictScore}/100</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={scoreRowAlt}>
                      <Text style={scoreName}>관계 현실 지수 (R)</Text>
                      <Text style={scoreValue}>{cognitiveScore}/100</Text>
                    </td>
                  </tr>
                </tbody>
              </table>

              <Text style={scoreInterpretation}>
                {attachmentScore >= 60 && cognitiveScore < 50 
                  ? "감정 반응은 강한 반면, 관계를 유지하려는 실제 행동과 반응은 이미 크게 감소한 상태입니다."
                  : attachmentScore >= 60 && cognitiveScore >= 50
                  ? "감정 반응과 관계 현실이 비교적 균형을 이루고 있으나, 주의가 필요합니다."
                  : "관계 현실을 객관적으로 바라볼 수 있는 상태입니다."}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Key Action */}
            <Section style={actionSection}>
              <Text style={sectionTitle}>📌 지금 가장 이득인 선택</Text>
              <Text style={actionText}>{getActionAdvice(resultType)}</Text>
              <Text style={actionNote}>
                이 선택은 이별을 확정하라는 의미가 아니라,
                더 큰 손해를 막기 위한 전략적 정지입니다.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Warning */}
            <Section style={warningSection}>
              <Text style={warningTitle}>⚠️ 주의사항</Text>
              <Text style={warningText}>
                지금 이 상태에서 충동적으로 연락하면
                관계 회복 선택지는 더 줄어듭니다.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Next Steps */}
            <Section>
              <Text style={sectionTitle}>📋 결과가 바뀔 수 있는 조건</Text>
              <Text style={tipText}>• 상대의 자발적 반응</Text>
              <Text style={tipText}>• 연락 주도권 변화</Text>
              <Text style={tipText}>• 감정 표현 신호 발생</Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 관계진단리포트. All rights reserved.
            </Text>
            <Text style={footerSubtext}>
              본 서비스는 개인의 성향을 단정하지 않으며, 입력된 정보와 현재 관계 행동 구조를 기반으로 한 심리학적 분석 결과를 제공합니다.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
}

const header = {
  backgroundColor: "#1e293b",
  padding: "24px",
  textAlign: "center" as const,
}

const logo = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0",
}

const content = {
  padding: "32px 40px",
}

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 24px",
  textAlign: "center" as const,
}

const verdictCard = {
  backgroundColor: "#fef2f2",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  marginBottom: "24px",
  border: "1px solid #fecaca",
}

const verdictLabel = {
  color: "#666666",
  fontSize: "14px",
  margin: "0 0 8px",
}

const verdictValue = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 12px",
  color: "#dc2626",
}

const descriptionText = {
  color: "#666666",
  fontSize: "14px",
  margin: "0",
  lineHeight: "1.6",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
}

const sectionTitle = {
  color: "#1e293b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const scoreTable = {
  width: "100%",
  marginBottom: "16px",
}

const scoreRow = {
  backgroundColor: "#f8fafc",
  padding: "12px 16px",
}

const scoreRowAlt = {
  backgroundColor: "#ffffff",
  padding: "12px 16px",
}

const scoreName = {
  color: "#475569",
  fontSize: "14px",
  margin: "0",
  display: "inline-block",
}

const scoreValue = {
  color: "#1e293b",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
  float: "right" as const,
}

const scoreInterpretation = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
  padding: "12px",
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
}

const actionSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "20px",
  border: "1px solid #bbf7d0",
}

const actionText = {
  color: "#166534",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
  textAlign: "center" as const,
}

const actionNote = {
  color: "#166534",
  fontSize: "13px",
  margin: "0",
  textAlign: "center" as const,
}

const warningSection = {
  backgroundColor: "#fffbeb",
  borderRadius: "8px",
  padding: "16px",
  border: "1px solid #fde68a",
}

const warningTitle = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
}

const warningText = {
  color: "#92400e",
  fontSize: "13px",
  margin: "0",
  lineHeight: "1.5",
}

const tipText = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 8px",
}

const footer = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  textAlign: "center" as const,
}

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 8px",
}

const footerSubtext = {
  color: "#94a3b8",
  fontSize: "11px",
  margin: "0",
  lineHeight: "1.5",
}
