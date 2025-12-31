import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Shield, TrendingDown, ChevronRight, Users, FileText, Brain, Lock } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-background dark:from-rose-950/20 dark:to-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-sm text-rose-700 dark:text-rose-300">
            <Users className="w-4 h-4" />
            <span>현재 <strong>12명</strong>이 실시간으로 관계 진단 중</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
            지금 이 선택이,
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              나중에 더 아픈 선택인지
            </span>
            <br />
            먼저 확인하세요.
          </h1>

          <div className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed space-y-2">
            <p>이별 직후의 판단은</p>
            <p>대부분 <strong className="text-foreground">감정 반응에 의해 왜곡</strong>됩니다.</p>
            <p className="pt-2">
              이 리포트는 위로가 아니라
              <br />
              <strong className="text-foreground">'손해를 피하는 선택'</strong>을
              <br />
              진짜 심리학 & 당신의 상황을 기반으로 판정합니다.
            </p>
          </div>

          <Link href="/analysis">
            <Button size="lg" className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xl shadow-rose-500/25">
              무료 관계 진단 시작하기
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-4">
            4,289명의 이별 데이터 분석 완료 · 논문 및 애착이론 모델 적용
          </p>
        </div>
      </section>

      {/* What This Is NOT */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 md:p-8 border-rose-200/50 dark:border-rose-800/30 bg-rose-50/50 dark:bg-rose-900/10">
            <h2 className="text-xl font-bold mb-6 text-center">이 서비스는</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">❌</div>
                <p className="font-medium text-muted-foreground">연애 상담</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">❌</div>
                <p className="font-medium text-muted-foreground">위로 콘텐츠</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">❌</div>
                <p className="font-medium text-muted-foreground">성향 테스트</p>
              </div>
            </div>
            <p className="text-center text-foreground font-medium">가 아닙니다.</p>
          </Card>
        </div>
      </section>

      {/* What This IS */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 md:p-8 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-rose-900/50 shadow-lg flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-rose-500" />
              </div>
              <p className="text-lg leading-relaxed">
                사용자가 제공한
                <br />
                <strong>'텍스트 증거 + 행동 패턴 데이터'</strong>를 기반으로
                <br /><br />
                현재 관계에서
                <br />
                <span className="text-rose-600 dark:text-rose-400 font-bold text-xl">
                  가장 손해가 적은 선택을 판정
                </span>해주는
                <br /><br />
                <strong>심리 기반 관계 진단 서비스</strong>입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">진단 프로세스</h2>
          <p className="text-muted-foreground text-center mb-12">
            감정이 아닌 <strong>데이터</strong>로 판정합니다
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">상황 입력</h3>
                <p className="text-muted-foreground text-sm">
                  마지막 대화 복붙
                  <br />
                  + 구조화 질문 3개
                </p>
                <p className="text-xs text-rose-500 mt-2 font-medium">무료</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">행동 체크리스트</h3>
                <p className="text-muted-foreground text-sm">
                  25문항
                  <br />
                  실제 있었던 일 기준
                </p>
                <p className="text-xs text-rose-500 mt-2 font-medium">무료</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">판정 리포트</h3>
                <p className="text-muted-foreground text-sm">
                  손해 최소화 전략
                  <br />+ 구체적 행동 가이드
                </p>
                <p className="text-xs text-muted-foreground mt-2">₩9,900</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center border-rose-200/50 dark:border-rose-800/30">
            <FileText className="w-8 h-8 mx-auto mb-3 text-rose-500" />
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">4,289</div>
            <p className="text-sm text-muted-foreground">이별 데이터 분석 완료</p>
          </Card>
          <Card className="p-6 text-center border-rose-200/50 dark:border-rose-800/30">
            <Brain className="w-8 h-8 mx-auto mb-3 text-rose-500" />
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">25</div>
            <p className="text-sm text-muted-foreground">심리학 기반 체크리스트</p>
          </Card>
          <Card className="p-6 text-center border-rose-200/50 dark:border-rose-800/30">
            <TrendingDown className="w-8 h-8 mx-auto mb-3 text-rose-500" />
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">78%</div>
            <p className="text-sm text-muted-foreground">평균 관계 리스크 감소</p>
          </Card>
        </div>
      </section>

      {/* Warning */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto p-6 md:p-8 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2 text-amber-800 dark:text-amber-200">
                이 상태에서 감정대로 행동하면
              </h3>
              <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                관계 회복 선택지는 <strong>더 줄어듭니다.</strong>
                <br /><br />
                이 리포트는 '다시 잘되게 만드는 방법'이 아니라
                <br />
                <strong>'망하지 않게 막는 판정'</strong>입니다.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-rose-500 to-pink-500 text-white border-0">
          <Lock className="w-12 h-12 mx-auto mb-6 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            지금 이 선택이 맞는지
            <br />
            먼저 확인하세요
          </h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto">
            충동적 연락 한 번이
            <br />
            3개월의 회복 기회를 날릴 수 있습니다.
          </p>
          <Link href="/analysis">
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 h-auto bg-white text-rose-600 hover:bg-rose-50">
              무료 관계 진단 시작
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
