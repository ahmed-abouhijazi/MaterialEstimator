"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, Calculator } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        // Redirect to login after 3 seconds
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              BuildCalc Pro
            </span>
          </Link>
        </div>

        <Card className="border-2 border-border">
          <CardContent className="pt-8 pb-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                <h2 className="text-2xl font-bold mb-2">Verifying Email...</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-green-600">Email Verified! ✓</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecting to login page...
                </p>
                <Link href="/login">
                  <Button className="bg-primary text-primary-foreground">
                    Go to Login
                  </Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-destructive">Verification Failed</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="flex gap-2 justify-center">
                  <Link href="/signup">
                    <Button variant="outline">Sign Up Again</Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-primary text-primary-foreground">
                      Try Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
