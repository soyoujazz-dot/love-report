"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle2, Loader2, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConfirming, setIsConfirming] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)

  const orderId = searchParams.get("orderId")
  const paymentKey = searchParams.get("paymentKey")
  const amount = searchParams.get("amount")
  const sku = searchParams.get("sku")
  const email = searchParams.get("email")

  useEffect(() => {
    async function confirmPayment() {
      if (!orderId || !paymentKey || !amount) {
        setError("결제 정보가 올바르지 않습니다.")
        setIsConfirming(false)
        return
      }

      try {
        const response = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            paymentKey,
            amount: Number(amount),
            email,
            sku,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "결제 승인에 실패했습니다.")
        }

        setPaymentData(data)
        setIsSuccess(true)
      } catch (err) {
        console.error("Payment confirmation error:", err)
        setError(err instanceof Error ? err.message : "결제 승인 중 오류가 발생했습니다.")
      } finally {
        setIsConfirming(false)
      }
    }

    confirmPayment()
  }, [orderId, paymentKey, amount])

  // 로딩 중
  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-rose-500 mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-2">결제 승인 중...</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요.</p>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // 에러
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold mb-2">결제 승인 실패</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.back()}>
              다시 시도하기
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // 성공
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="p-8 text-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다!</h1>
          <p className="text-muted-foreground mb-8">
            리포트가 곧 준비됩니다.
          </p>

          <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">결제 금액</p>
                <p className="font-bold text-lg">₩{Number(amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">주문 번호</p>
                <p className="font-mono text-xs">{orderId}</p>
              </div>
            </div>
          </div>

          {email && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Mail className="w-4 h-4" />
              <span>리포트가 <strong>{email}</strong>로 전송됩니다.</span>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <Link href="/analysis" className="block">
            <Button className="w-full bg-rose-600 hover:bg-rose-500" size="lg">
              새로운 분석 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full" size="lg">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

