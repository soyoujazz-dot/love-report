"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { loadTossPayments } from "@tosspayments/tosspayments-sdk"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Loader2, CreditCard, ShieldCheck } from "lucide-react"

// 클라이언트 키 (테스트용)
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"

// 상품 정보
const productInfo: Record<string, { name: string; price: number; description: string }> = {
  "RECHECK_14D": {
    name: "관계 변화 후 재분석 리포트",
    price: 7900,
    description: "상황이 바뀌었을 때 다시 계산합니다.",
  },
  "TEXT_RISK": {
    name: "연락 리스크 분석",
    price: 5900,
    description: "지금 이 문장, 보내도 될까?",
  },
  "SIMULATION": {
    name: "재회 가능성 시뮬레이션",
    price: 9900,
    description: "이 행동을 하면 관계는 어떻게 변할까?",
  },
}

function generateRandomString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const sku = searchParams.get("sku") || "TEXT_RISK"
  const email = searchParams.get("email") || ""
  
  const product = productInfo[sku] || productInfo["TEXT_RISK"]
  
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: product.price,
  })
  const [ready, setReady] = useState(false)
  const [widgets, setWidgets] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        // SDK 초기화
        const tossPayments = await loadTossPayments(clientKey)
        
        // 비회원 결제 (ANONYMOUS)
        const widgets = tossPayments.widgets({
          customerKey: generateRandomString(),
        })
        
        setWidgets(widgets)
      } catch (error) {
        console.error("Error fetching payment widget:", error)
      }
    }

    fetchPaymentWidgets()
  }, [])

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return
      }

      try {
        // 결제 금액 설정
        await widgets.setAmount(amount)

        // 결제 UI 렌더링
        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        })

        // 이용약관 UI 렌더링
        await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        })

        setReady(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Error rendering payment widgets:", error)
        setIsLoading(false)
      }
    }

    renderPaymentWidgets()
  }, [widgets, amount])

  const handlePayment = async () => {
    if (!widgets || !ready) return

    try {
      const orderId = `ORDER_${Date.now()}_${generateRandomString().slice(0, 8)}`
      
      await widgets.requestPayment({
        orderId,
        orderName: product.name,
        successUrl: `${window.location.origin}/payment/success?sku=${sku}&email=${encodeURIComponent(email)}`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: email || undefined,
        customerName: "고객",
      })
    } catch (error) {
      console.error("Payment request error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">결제하기</h1>
          <p className="text-muted-foreground text-sm">
            안전한 토스페이먼츠 결제로 진행됩니다.
          </p>
        </div>

        {/* 상품 정보 */}
        <Card className="p-6 mb-6 border-rose-200 dark:border-rose-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold mb-1">{product.name}</h2>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-rose-600">
                ₩{product.price.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* 결제 위젯 영역 */}
        <Card className="p-6 mb-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <span className="ml-3 text-muted-foreground">결제 수단을 불러오는 중...</span>
            </div>
          )}
          
          {/* 결제 UI */}
          <div id="payment-method" className={isLoading ? "hidden" : ""} />
          
          {/* 이용약관 UI */}
          <div id="agreement" className={isLoading ? "hidden" : ""} />
        </Card>

        {/* 결제 버튼 */}
        <Button
          className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-500"
          onClick={handlePayment}
          disabled={!ready}
        >
          {!ready ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              준비 중...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {product.price.toLocaleString()}원 결제하기
            </>
          )}
        </Button>

        {/* 안내 문구 */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <span>토스페이먼츠 안전결제 시스템으로 보호됩니다</span>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

