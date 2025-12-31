import { Resend } from "resend"
import AnalysisResultEmail from "@/emails/iq-result"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      resultType, 
      attachmentScore, 
      emotionScore, 
      conflictScore, 
      cognitiveScore, 
      selfScore,
      situationSummary 
    } = body

    // 입력 검증
    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "유효한 이메일 주소를 입력해주세요." },
        { status: 400 }
      )
    }

    if (!resultType) {
      return Response.json(
        { error: "분석 결과가 없습니다." },
        { status: 400 }
      )
    }

    // 이메일 전송
    const { data, error } = await resend.emails.send({
      from: "마음정리연구소 <noreply@testresults.bluenomad.space>",
      to: [email],
      subject: `💕 당신의 관계 패턴 분석 결과: ${resultType}`,
      react: AnalysisResultEmail({
        resultType,
        attachmentScore: attachmentScore || 0,
        emotionScore: emotionScore || 0,
        conflictScore: conflictScore || 0,
        cognitiveScore: cognitiveScore || 0,
        selfScore: selfScore || 0,
        situationSummary: situationSummary || "",
      }),
    })

    if (error) {
      console.error("Email send error:", error)
      return Response.json(
        { error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      )
    }

    return Response.json({ 
      success: true, 
      message: "이메일이 성공적으로 전송되었습니다.",
      id: data?.id 
    })

  } catch (error) {
    console.error("API error:", error)
    return Response.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
