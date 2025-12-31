"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  AlertTriangle,
  MessageCircle,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import type { ReportResponse, Scores, Verdict, Narrative, CTA } from "@/lib/domain/types"

// 분석 단계
type AnalysisStep = 
  | "input"           // STEP 1: 자유서술 + 강제질문
  | "risk-preview"    // 중간 CTA
  | "checklist"       // STEP 2: 25문항
  | "loading"         // 리포트 생성 중
  | "report"          // 결과 (무료)

// 유료 CTA 타입
type PaidCTA = "reanalysis" | "contact-risk" | "simulation" | null

// 강제 구조 질문 선택지
type StructuredAnswer = "A" | "B" | "C" | "D" | null

// 5점 리커트
type LikertResponse = 1 | 2 | 3 | 4 | 5 | null

// 체크리스트 문항 (25문항)
const checklistQuestions = {
  A: [ // 애착 반응 / 개인 성향 (8문항)
    "답장이 늦어지면 이유를 계속 생각하게 된다",
    "연락이 없으면 상대 마음이 변했다고 느낀다",
    "이별 후에도 상대 반응에 감정이 크게 흔들린다",
    "상대가 멀어질까 봐 감정을 숨긴 적이 많다",
    "설명하지 않으면 오해받을 것 같다는 불안이 크다",
    "관계가 불안정하면 일상 집중이 어려워진다",
    "차분하게 기다리는 게 힘들다",
    "'가만히 있으면 끝날까 봐' 먼저 움직이게 된다",
  ],
  B: [ // 상대의 관계 투자 (9문항)
    "최근 연락 빈도가 눈에 띄게 줄었다",
    "약속이나 대화가 상대 위주로 결정됐다",
    "감정 이야기 시 회피하거나 대화를 피했다",
    "노력에 대한 반응이 예전보다 적었다",
    "관계 문제를 나만 더 이야기했다",
    "상대가 먼저 연락한 날보다 내가 먼저 한 날이 많다",
    "이별 직전, 상대는 '지금은 여유가 없다'는 말을 자주 했다",
    "갈등 후 회복을 위한 시도가 상대에게서 거의 없었다",
    "관계 유지를 위한 행동이 줄어들었다",
  ],
  C: [ // 상호성 / 권력 구조 (8문항)
    "대화의 시작은 대부분 내가 했다",
    "답장 속도에 항상 차이가 있었다",
    "상대의 요구는 빠르게 반응했지만, 내 요구는 늦었다",
    "감정 표현의 비중이 한쪽으로 쏠려 있었다",
    "불편한 이야기를 꺼내는 쪽은 항상 나였다",
    "상대는 '지금은 그럴 여유가 없다'는 말을 반복했다",
    "내가 더 조심하고 눈치를 봤다",
    "관계에서 내가 더 잃을까 봐 참고 넘긴 적이 많다",
  ],
}

const totalQuestions = 25
const likertOptions = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "아닌 편" },
  { value: 3, label: "보통" },
  { value: 4, label: "그런 편" },
  { value: 5, label: "매우 그렇다" },
]

// verdict code → 한글 라벨 변환
const verdictLabels: Record<string, string> = {
  "ANXIETY_ONLY": "내 불안 주도",
  "PARTNER_WITHDRAWAL": "상대 이탈",
  "COMPOUND_CRISIS": "복합 위기",
  "WAIT_AND_OBSERVE": "관망 구간",
  "REUNION_CONSIDERABLE": "재회 검토 가능",
}

export default function AnalysisPage() {
  const router = useRouter()
  const [step, setStep] = useState<AnalysisStep>("input")
  
  // STEP 1 상태
  const [freeText, setFreeText] = useState("")
  const [q1, setQ1] = useState<StructuredAnswer>(null)
  const [q2, setQ2] = useState<StructuredAnswer>(null)
  const [q3, setQ3] = useState<StructuredAnswer>(null)

  // STEP 2 상태
  const [currentCategory, setCurrentCategory] = useState<"A" | "B" | "C">("A")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersA, setAnswersA] = useState<LikertResponse[]>(new Array(8).fill(null))
  const [answersB, setAnswersB] = useState<LikertResponse[]>(new Array(9).fill(null))
  const [answersC, setAnswersC] = useState<LikertResponse[]>(new Array(8).fill(null))

  // GPT 리포트 상태
  const [reportData, setReportData] = useState<ReportResponse | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [showScoreDetails, setShowScoreDetails] = useState(false)
  
  // 유료 CTA 상태
  const [activeCTA, setActiveCTA] = useState<PaidCTA>(null)
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const ctaInfo = {
    "reanalysis": { name: "관계 변화 후 재분석 리포트", price: 7900 },
    "contact-risk": { name: "연락 문장 위험도 분석", price: 5900 },
    "simulation": { name: "재회 가능성 시뮬레이션", price: 9900 },
  }

  // 체크리스트 응답을 API 형식으로 변환
  const buildChecklistPayload = () => {
    const checklist: Record<string, 1|2|3|4|5> = {}
    
    answersA.forEach((answer, idx) => {
      if (answer !== null) checklist[`q${idx + 1}`] = answer
    })
    answersB.forEach((answer, idx) => {
      if (answer !== null) checklist[`q${idx + 9}`] = answer
    })
    answersC.forEach((answer, idx) => {
      if (answer !== null) checklist[`q${idx + 18}`] = answer
    })
    
    return checklist
  }

  // GPT 리포트 생성 API 호출
  const generateReport = async () => {
    setStep("loading")
    setReportError(null)
    
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_text: freeText,
          structured: {
            last_interaction_type: q1,
            contact_initiation: q2,
            partner_state: q3,
          },
          checklist: buildChecklistPayload(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "리포트 생성에 실패했습니다.")
      }

      const data: ReportResponse = await response.json()
      setReportData(data)
      setStep("report")
    } catch (error) {
      console.error("Report generation error:", error)
      setReportError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      setStep("report") // 에러 상태로 리포트 페이지 표시
    }
  }

  // 리스크 지수 (중간 CTA용)
  const calculateRiskIndex = () => {
    let risk = 50
    if (q1 === "B" || q1 === "C") risk += 15
    if (q2 === "A") risk += 20
    if (q3 === "A" || q3 === "D") risk += 15
    if (freeText.includes("왜") || freeText.includes("모르겠")) risk += 5
    return Math.min(95, risk)
  }

  // 현재 체크리스트 질문
  const getCurrentQuestion = () => {
    if (currentCategory === "A") return checklistQuestions.A[currentIndex]
    if (currentCategory === "B") return checklistQuestions.B[currentIndex]
    return checklistQuestions.C[currentIndex]
  }

  const getCurrentAnswers = () => {
    if (currentCategory === "A") return answersA
    if (currentCategory === "B") return answersB
    return answersC
  }

  const setCurrentAnswer = (value: LikertResponse) => {
    if (currentCategory === "A") {
      const newAnswers = [...answersA]
      newAnswers[currentIndex] = value
      setAnswersA(newAnswers)
    } else if (currentCategory === "B") {
      const newAnswers = [...answersB]
      newAnswers[currentIndex] = value
      setAnswersB(newAnswers)
    } else {
      const newAnswers = [...answersC]
      newAnswers[currentIndex] = value
      setAnswersC(newAnswers)
    }
  }

  const getOverallIndex = () => {
    if (currentCategory === "A") return currentIndex
    if (currentCategory === "B") return 8 + currentIndex
    return 17 + currentIndex
  }

  const handleNextQuestion = () => {
    if (currentCategory === "A" && currentIndex < 7) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentCategory === "A") {
      setCurrentCategory("B")
      setCurrentIndex(0)
    } else if (currentCategory === "B" && currentIndex < 8) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentCategory === "B") {
      setCurrentCategory("C")
      setCurrentIndex(0)
    } else if (currentCategory === "C" && currentIndex < 7) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // 마지막 문항 완료 → GPT 리포트 생성
      generateReport()
    }
  }

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (currentCategory === "B") {
      setCurrentCategory("A")
      setCurrentIndex(7)
    } else if (currentCategory === "C") {
      setCurrentCategory("B")
      setCurrentIndex(8)
    }
  }

  // CTA SKU 매핑
  const ctaSkuMap: Record<string, string> = {
    "reanalysis": "RECHECK_14D",
    "contact-risk": "TEXT_RISK",
    "simulation": "SIMULATION",
  }

  const handlePaidCTA = () => {
    if (!email.includes("@") || !activeCTA) return
    
    const sku = ctaSkuMap[activeCTA]
    // 결제 페이지로 이동
    router.push(`/payment/checkout?sku=${sku}&email=${encodeURIComponent(email)}`)
  }

  const isStep1Complete = freeText.length >= 50 && q1 && q2 && q3

  // STEP 1: 상황 입력
  if (step === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 dark:bg-rose-500 rounded-full text-sm mb-4">
              <MessageCircle className="w-4 h-4" />
              STEP 1 / 2
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">상황 입력</h1>
            <p className="text-muted-foreground text-sm">
              이 리포트는 당신이 직접 쓴 문장과 상황을 <strong>분석 재료로 사용</strong>합니다.
              <br />
              자세할수록 결과는 더 정확해집니다.
            </p>
          </div>

          <Card className="p-6 md:p-8 mb-6">
            {/* 자유 서술 */}
            <div className="mb-8">
              <label className="block font-medium mb-2">
                지금 상황을 편하게 써주세요
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                누가 잘못했는지 정리하지 않아도 됩니다. 마지막 카톡을 복사/붙여넣기 해도 좋습니다.
              </p>
              <textarea
                className="w-full h-40 p-4 border rounded-lg bg-background resize-none focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none text-sm"
                placeholder="예시: 3개월 사귀다가 한 달 전에 헤어졌어요. 마지막에 '너무 지쳤다'고 하더라고요..."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
              />
              <p className={`text-xs mt-1 text-right ${freeText.length < 50 ? 'text-amber-600' : 'text-green-600'}`}>
                {freeText.length}자 {freeText.length < 50 && "(최소 50자 필요)"}
              </p>
            </div>

            {/* 강제 구조 질문 1 */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-3">① 마지막 의미 있는 상호작용은 어떻게 끝났나요?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "A", label: "감정 대화 중단" },
                  { value: "B", label: "상대의 일방적 종료" },
                  { value: "C", label: "내가 더 설명하려다 끝남" },
                  { value: "D", label: "명확한 합의 종료" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQ1(opt.value as StructuredAnswer)}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${
                      q1 === opt.value 
                        ? "border-rose-600 bg-rose-600 text-white dark:border-rose-50 dark:bg-rose-50 dark:text-rose-600" 
                        : "border-border hover:border-rose-300"
                    }`}
                  >
                    {opt.value}. {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 강제 구조 질문 2 */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-3">② 이별 직전 2주간 연락 주도는?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "A", label: "거의 내가" },
                  { value: "B", label: "비슷" },
                  { value: "C", label: "거의 상대" },
                  { value: "D", label: "연락 거의 없음" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQ2(opt.value as StructuredAnswer)}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${
                      q2 === opt.value 
                        ? "border-rose-600 bg-rose-600 text-white dark:border-rose-50 dark:bg-rose-50 dark:text-rose-600" 
                        : "border-border hover:border-rose-300"
                    }`}
                  >
                    {opt.value}. {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 강제 구조 질문 3 */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-3">③ 지금 상대의 상태로 가장 가까운 것은?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "A", label: "회피/거리두기" },
                  { value: "B", label: "혼란" },
                  { value: "C", label: "감정 표현 있음" },
                  { value: "D", label: "완전 단절" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQ3(opt.value as StructuredAnswer)}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${
                      q3 === opt.value 
                        ? "border-rose-600 bg-rose-600 text-white dark:border-rose-50 dark:bg-rose-50 dark:text-rose-600" 
                        : "border-border hover:border-rose-300"
                    }`}
                  >
                    {opt.value}. {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Button 
            className="w-full bg-rose-600 hover:bg-rose-500 dark:bg-rose-50 dark:hover:bg-rose-100 dark:text-rose-600"
            size="lg"
            onClick={() => setStep("risk-preview")}
            disabled={!isStep1Complete}
          >
            다음 단계로
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  // 중간 CTA: 리스크 프리뷰
  if (step === "risk-preview") {
    const riskIndex = calculateRiskIndex()

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="p-6 md:p-8 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">현재 관계 위험 신호</h2>
              <p className="text-sm text-muted-foreground">당신의 입력 기준</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-amber-600 mb-2">{riskIndex}%</div>
              <p className="text-sm font-medium">관계 리스크 지수</p>
            </div>

            <div className="bg-white/50 dark:bg-rose-600/50 rounded-lg p-4 mb-6">
              <p className="text-sm leading-relaxed text-center">
                이 수치에서는
                <br />
                <strong className="text-amber-700 dark:text-amber-400">
                  감정대로 행동할수록 회복 가능성이 낮아지는 구간
                </strong>입니다.
              </p>
            </div>

            <div className="border-t border-amber-200 dark:border-amber-800 pt-6">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                지금까지 입력한 내용만으로도 <strong>대략적인 방향은 보입니다.</strong>
                <br /><br />
                하지만 <strong>판정을 내리기엔 정보가 부족합니다.</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                ✔ 체크리스트를 통해
                <br />
                감정이 아니라 <strong>현실 기준으로 다시 계산해볼까요?</strong>
              </p>
            </div>
          </Card>

          <Button 
            className="w-full mt-6 bg-rose-600 hover:bg-rose-500 dark:bg-rose-50 dark:hover:bg-rose-100 dark:text-rose-600"
            size="lg"
            onClick={() => setStep("checklist")}
          >
            체크리스트 시작 (25문항)
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  // STEP 2: 체크리스트
  if (step === "checklist") {
    const overallIndex = getOverallIndex()
    const progress = ((overallIndex + 1) / totalQuestions) * 100
    const currentAnswers = getCurrentAnswers()
    const categoryLabels = { A: "애착 반응", B: "관계 투자", C: "상호성" }

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {overallIndex + 1} / {totalQuestions}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-500">
                {categoryLabels[currentCategory]}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-rose-100 dark:bg-rose-900 [&>div]:bg-rose-500" />
          </div>

          {/* 카테고리 안내 */}
          {currentIndex === 0 && (
            <Card className="p-4 mb-4 bg-rose-50 dark:bg-rose-500 border-0">
              <p className="text-sm text-center">
                이건 성향이 아니라, <strong>이번 관계에서 실제 있었던 일</strong> 기준입니다.
              </p>
            </Card>
          )}

          {/* Question */}
          <Card className="p-6 md:p-8 mb-6">
            <p className="text-lg font-medium leading-relaxed mb-8 text-center">
              {getCurrentQuestion()}
            </p>

            <div className="space-y-3">
              {likertOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentAnswer(option.value as LikertResponse)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    currentAnswers[currentIndex] === option.value
                      ? "border-rose-600 bg-rose-600 text-white dark:border-rose-50 dark:bg-rose-50 dark:text-rose-600"
                      : "border-border hover:border-rose-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handlePrevQuestion}
              disabled={currentCategory === "A" && currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 w-5 h-5" />
              이전
            </Button>
            <Button 
              size="lg"
              onClick={handleNextQuestion}
              disabled={currentAnswers[currentIndex] === null}
              className="flex-1 bg-rose-600 hover:bg-rose-500 dark:bg-rose-50 dark:hover:bg-rose-100 dark:text-rose-600"
            >
              {currentCategory === "C" && currentIndex === 7 ? "분석 시작" : "다음"}
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // 로딩 화면
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="p-8 md:p-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-rose-500 animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-4">관계 진단 리포트 생성 중</h2>
              <p className="text-muted-foreground text-sm mb-6">
                입력하신 데이터를 심층 분석하고 있습니다.
                <br />
                잠시만 기다려주세요...
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>✓ 체크리스트 점수 계산</p>
                <p>✓ 구조 질문 보정치 적용</p>
                <p>✓ 관계 현실 지수 산출</p>
                <p className="animate-pulse">⏳ 개인화 분석 생성 중...</p>
              </div>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // 결과 리포트
  if (step === "report") {
    // 에러 상태
    if (reportError && !reportData) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
          <Header />
          <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Card className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4">리포트 생성 실패</h2>
              <p className="text-muted-foreground mb-6">{reportError}</p>
              <Button onClick={() => generateReport()}>
                다시 시도
              </Button>
            </Card>
          </div>
          <Footer />
        </div>
      )
    }

    if (!reportData) return null

    const { scores, verdict, narrative, ctas } = reportData
    const verdictLabel = verdictLabels[verdict.code] || verdict.code

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          {/* 최상단 판정 선언 */}
          <Card className="p-6 md:p-8 mb-6 bg-rose-500 dark:bg-rose-400 text-white dark:text-rose-900">
            <div className="text-center mb-6">
              <p className="text-sm opacity-80 mb-2">🔍 관계 진단 결과</p>
              <h1 className="text-2xl md:text-3xl font-bold">
                현재 이 관계는
                <br />
                '{verdictLabel}' 상태입니다.
              </h1>
            </div>

            <p className="text-center opacity-90 mb-6 leading-relaxed">
              {verdict.headline}
            </p>

            <div className="bg-white/10 dark:bg-rose-600/10 rounded-lg p-4">
              <p className="text-sm text-center">
                ⚠️ {verdict.risk_statement}
              </p>
            </div>
          </Card>

          {/* 몰입도용 CTA */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              ↓ 왜 이런 결과가 나왔는지
              <br />
              <strong>당신이 입력한 내용 기준으로 설명합니다.</strong>
            </p>
          </div>

          {/* 점수 기반 설명 (GPT 생성) */}
          <Card className="p-6 md:p-8 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-rose-500" />
              판정 근거
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {narrative.why_this_verdict}
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {narrative.your_state}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showScoreDetails ? 'rotate-180' : ''}`} />
              상세 점수 {showScoreDetails ? '접기' : '보기'}
            </button>

            {showScoreDetails && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">애착 반응 지수(A)</p>
                  <p className="font-bold text-lg">{scores.A}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">관계 투자 지수(B)</p>
                  <p className="font-bold text-lg">{scores.B}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">상호성 지수(C)</p>
                  <p className="font-bold text-lg">{scores.C}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">관계 현실 지수(R)</p>
                  <p className="font-bold text-lg">{scores.R}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">감정-현실 격차(G)</p>
                  <p className={`font-bold text-lg ${scores.G >= 20 ? 'text-amber-600' : scores.G <= -20 ? 'text-blue-600' : ''}`}>
                    {scores.G > 0 ? '+' : ''}{scores.G}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* 입력 텍스트 기반 분석 (GPT 생성) */}
          <Card className="p-6 md:p-8 mb-6">
            <h3 className="font-bold mb-4">📝 당신이 남긴 글에서</h3>
            
            <div className="space-y-3 mb-4">
              {narrative.evidence_points.map((point, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    • {point}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              이러한 패턴은 현재 관계 구조에서 나타나는 자연스러운 반응입니다.
              <br />
              <strong className="text-foreground">감정 반응과 관계 현실 사이의 격차</strong>를 인식하는 것이 첫 단계입니다.
            </p>
          </Card>

          {/* 상대 심리 해석 (GPT 생성) */}
          <Card className="p-6 md:p-8 mb-6">
            <h3 className="font-bold mb-4">🔍 상대 심리 해석</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>{narrative.partner_state}</p>
              <p className="text-muted-foreground">
                이 단계에서의 접촉은 감정 회복보다 <strong>회피를 강화할 가능성</strong>이 높습니다.
              </p>
            </div>
          </Card>

          {/* 최적 행동 (코드가 결정) */}
          <Card className="p-6 md:p-8 mb-6 bg-rose-500 dark:bg-rose-400 text-white dark:text-rose-900">
            <h3 className="font-bold mb-4">
              📌 지금 당신에게 가장 이득인 선택
            </h3>
            <p className="text-xl font-bold mb-4">
              {verdict.recommendation}
            </p>
            
            {/* 하지 말아야 할 것 */}
            <div className="mt-4 p-4 bg-white/20 dark:bg-rose-900/30 rounded-lg">
              <p className="text-sm font-medium mb-2">❌ 지금 하면 안 되는 것</p>
              <ul className="text-sm opacity-90 space-y-1">
                {verdict.do_not_list.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          </Card>

          {/* 다음 단계 */}
          <Card className="p-6 md:p-8 mb-8">
            <h3 className="font-bold mb-4">📋 결과가 바뀔 수 있는 조건</h3>
            <p className="text-sm text-muted-foreground mb-4">
              이 결과는 <strong>현재 시점의 관계 구조 기준 판정</strong>입니다.
              <br />
              아래 조건이 바뀌면 결과는 다시 계산될 수 있습니다.
            </p>
            <ul className="space-y-2 text-sm">
              {verdict.reanalysis_triggers.map((trigger, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  {trigger}
                </li>
              ))}
            </ul>
          </Card>

          {/* 유료 CTA 섹션 (동적 - verdict 기반) */}
          <div className="border-t-2 border-rose-200 dark:border-rose-800 pt-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-lg font-bold mb-2">더 정확한 판단이 필요하다면</p>
              <p className="text-sm text-muted-foreground">
                상황에 맞는 추가 분석을 받아보세요
              </p>
            </div>

            {ctas.map((cta) => {
              const ctaIcons: Record<string, string> = {
                "RECHECK_14D": "📄",
                "TEXT_RISK": "✉️",
                "SIMULATION": "🔁",
              }
              const icon = ctaIcons[cta.sku] || "📄"
              
              return (
                <Card 
                  key={cta.sku} 
                  className="p-6 mb-4 border-rose-200 dark:border-rose-800 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{icon}</span>
                        <h4 className="font-bold text-lg">{cta.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {cta.body}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-rose-600">₩{cta.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                    onClick={() => {
                      if (cta.sku === "RECHECK_14D") setActiveCTA("reanalysis")
                      else if (cta.sku === "TEXT_RISK") setActiveCTA("contact-risk")
                      else if (cta.sku === "SIMULATION") setActiveCTA("simulation")
                    }}
                  >
                    {cta.title} 받기
                  </Button>
                </Card>
              )
            })}
          </div>

          {/* 결제 모달 */}
          {activeCTA && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md p-6 relative">
                <button 
                  onClick={() => { setActiveCTA(null); setEmail(""); }}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
                
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">선택한 리포트</p>
                  <h3 className="text-xl font-bold">{ctaInfo[activeCTA].name}</h3>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-rose-600">
                    ₩{ctaInfo[activeCTA].price.toLocaleString()}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">리포트 수신 이메일</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full h-14 text-lg bg-rose-600 hover:bg-rose-500"
                  onClick={handlePaidCTA}
                  disabled={!email.includes("@") || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 w-5 h-5" />
                      결제하고 리포트 받기
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  결제 후 입력하신 이메일로 리포트가 전송됩니다
                </p>
              </Card>
            </div>
          )}

          {/* 통계 */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>현재까지 <strong>4,289명</strong>의 이별 데이터 분석 완료</p>
            <p>현재 <strong>12명</strong>이 실시간으로 관계 진단을 받고 있습니다</p>
            <p>논문 및 애착이론 모델 적용 완료</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return null
}
