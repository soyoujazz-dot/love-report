import { Heart } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500" />
          <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            관계진단리포트
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-rose-500 transition-colors">
            홈
          </Link>
          <Link href="/analysis" className="text-sm font-medium hover:text-rose-500 transition-colors">
            무료 진단
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-rose-500 transition-colors">
            문의
          </Link>
        </nav>
      </div>
    </header>
  )
}
