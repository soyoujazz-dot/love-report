import { Heart } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                관계진단리포트
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              심리학 기반 관계 진단 서비스
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/analysis" className="hover:text-rose-500 transition-colors">
                  무료 진단
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="hover:text-rose-500 transition-colors">
                  리포트 구매
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">정보</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-rose-500 transition-colors">
                  분석 근거
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-rose-500 transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-rose-500 transition-colors">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rose-500 transition-colors">
                  이용 약관
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">© 2024 관계진단리포트. All rights reserved.</p>
          <p className="text-xs">
            본 서비스는 개인의 성향을 단정하지 않으며, 입력된 정보와 현재 관계 행동 구조를 기반으로 한 심리학적 분석 결과를 제공합니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
