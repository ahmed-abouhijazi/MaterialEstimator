"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, HardHat } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
            <HardHat className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
            BuildCalc Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/estimator" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            Estimator
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            Dashboard
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            Pricing
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            How It Works
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent">
            Sign In
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started Free
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-secondary bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link
              href="/estimator"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Estimator
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" className="w-full border-secondary text-secondary bg-transparent">
                Sign In
              </Button>
              <Button className="w-full bg-primary text-primary-foreground">
                Get Started Free
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
