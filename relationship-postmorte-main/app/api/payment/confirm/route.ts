import { NextResponse } from "next/server"
import { Resend } from "resend"

// 시크릿 키 (테스트용)
const secretKey = process.env.TOSS_SECRET_KEY || "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6"

// Base64 인코딩된 인증 헤더
const encryptedSecretKey = "Basic " + Buffer.from(secretKey + ":").toString("base64")

// Resend 클라이언트
const resend = new Resend(process.env.RESEND_API_KEY)

// 상품 정보
const productInfo: Record<string, { name: string; price: number }> = {
  "RECHECK_14D": { name: "관계 변화 후 재분석 리포트", price: 7900 },
  "TEXT_RISK": { name: "연락 리스크 분석", price: 5900 },
  "SIMULATION": { name: "재회 가능성 시뮬레이션", price: 9900 },
}

export async function POST(request: Request) {
  try {
    const { orderId, paymentKey, amount, email, sku } = await request.json()

    // 필수 파라미터 검증
    if (!orderId || !paymentKey || !amount) {
      return NextResponse.json(
        { code: "INVALID_REQUEST", message: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      )
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        paymentKey,
        amount,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Toss payment confirmation failed:", result)
      return NextResponse.json(
        { code: result.code, message: result.message },
        { status: response.status }
      )
    }

    // 결제 성공 로그
    console.log("Payment confirmed:", {
      orderId: result.orderId,
      paymentKey: result.paymentKey,
      amount: result.totalAmount,
      method: result.method,
      approvedAt: result.approvedAt,
    })

    // 이메일 발송
    if (email && email.includes("@")) {
      const product = productInfo[sku] || { name: result.orderName || "리포트" }
      
      try {
        const { error: emailError } = await resend.emails.send({
          from: "마음정리연구소 <noreply@testresults.bluenomad.space>",
          to: [email],
          subject: `💕 ${product.name} 구매가 완료되었습니다`,
          html: `
            <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #e11d48; margin-bottom: 10px;">💕 마음정리연구소</h1>
                <p style="color: #6b7280;">결제가 완료되었습니다</p>
              </div>
              
              <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">${product.name}</h2>
                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                  <strong>결제 금액:</strong> ₩${Number(result.totalAmount).toLocaleString()}
                </p>
                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                  <strong>주문 번호:</strong> ${result.orderId}
                </p>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  <strong>결제 일시:</strong> ${new Date(result.approvedAt).toLocaleString('ko-KR')}
                </p>
              </div>
              
              <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">📋 안내사항</h3>
                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                  구매하신 리포트는 준비가 완료되는 대로 이 이메일 주소로 발송됩니다.
                  문의사항이 있으시면 언제든지 연락해 주세요.
                </p>
              </div>
              
              <div style="text-align: center; color: #9ca3af; font-size: 12px;">
                <p>이 이메일은 마음정리연구소에서 발송되었습니다.</p>
              </div>
            </div>
          `,
        })

        if (emailError) {
          console.error("Email send error:", emailError)
        } else {
          console.log("Email sent successfully to:", email)
        }
      } catch (emailErr) {
        console.error("Email send exception:", emailErr)
        // 이메일 발송 실패해도 결제는 성공으로 처리
      }
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      paymentKey: result.paymentKey,
      amount: result.totalAmount,
      method: result.method,
      approvedAt: result.approvedAt,
      orderName: result.orderName,
      emailSent: !!email,
    })
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

