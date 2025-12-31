"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"

function FailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const code = searchParams.get("code") || "UNKNOWN_ERROR"
  const message = searchParams.get("message") || "결제 처리 중 오류가 발생했습니다."

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="p-8 text-center mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">결제에 실패했습니다</h1>
          <p className="text-muted-foreground mb-8">
            아래 내용을 확인하고 다시 시도해주세요.
          </p>

          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">에러 코드</p>
                <p className="font-mono text-red-600 dark:text-red-400">{code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">에러 메시지</p>
                <p className="text-red-600 dark:text-red-400">{message}</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>결제 오류가 지속될 경우 고객센터로 문의해주세요.</p>
          </div>
        </Card>

        <div className="space-y-3">
          <Button 
            className="w-full bg-rose-600 hover:bg-rose-500" 
            size="lg"
            onClick={() => router.back()}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            다시 시도하기
          </Button>
          <Link href="/analysis" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              분석 페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}

