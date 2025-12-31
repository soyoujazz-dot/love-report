"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Mail, MessageSquare, User } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background dark:from-rose-950">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">문의하기</h1>
            <p className="text-lg text-muted-foreground">궁금하신 사항이나 의견이 있으시면 언제든지 연락해 주세요.</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  이름
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력해주세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="focus:ring-rose-400 focus:border-rose-400"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="focus:ring-rose-400 focus:border-rose-400"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  메시지
                </label>
                <Textarea
                  id="message"
                  placeholder="문의 내용을 입력해주세요"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="focus:ring-rose-400 focus:border-rose-400"
                />
              </div>

              <Button type="submit" size="lg" className="w-full bg-rose-600 hover:bg-rose-500 dark:bg-rose-50 dark:hover:bg-rose-100 dark:text-rose-600">
                메시지 보내기
              </Button>
            </form>
          </Card>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold mb-2">응답 시간</h3>
              <p className="text-sm text-muted-foreground">평일 24시간 이내</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold mb-2">고객 지원</h3>
              <p className="text-sm text-muted-foreground">월-금 9:00-18:00</p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
