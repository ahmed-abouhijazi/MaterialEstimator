"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/dashboard',
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.login.error'))
      } else if (result?.ok) {
        // Successful login - redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              BuildCalc Pro
            </span>
          </Link>
          <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('auth.login.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.login.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                {t('auth.login.noAccount')}{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  {t('auth.login.signUp')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Account Info */}
        <Card className="mt-4 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-900 text-center">
              <strong>Demo:</strong> Create an account or estimate without signing in
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
