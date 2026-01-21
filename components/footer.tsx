import Link from "next/link"
import { HardHat } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t-2 border-secondary bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <HardHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                BuildCalc Pro
              </span>
            </Link>
            <p className="text-sm text-secondary-foreground/80">
              Your digital foreman. Get accurate material estimates for any construction project.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Product</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/estimator" className="text-sm text-secondary-foreground/80 hover:text-primary">
                Material Estimator
              </Link>
              <Link href="/dashboard" className="text-sm text-secondary-foreground/80 hover:text-primary">
                Dashboard
              </Link>
              <Link href="/pricing" className="text-sm text-secondary-foreground/80 hover:text-primary">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/how-it-works" className="text-sm text-secondary-foreground/80 hover:text-primary">
                How It Works
              </Link>
              <Link href="#" className="text-sm text-secondary-foreground/80 hover:text-primary">
                Material Guide
              </Link>
              <Link href="#" className="text-sm text-secondary-foreground/80 hover:text-primary">
                Blog
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Contact</h3>
            <nav className="flex flex-col gap-2">
              <a href="mailto:support@buildcalc.pro" className="text-sm text-secondary-foreground/80 hover:text-primary">
                support@buildcalc.pro
              </a>
              <p className="text-sm text-secondary-foreground/80">
                Built for contractors, by people who understand construction.
              </p>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-secondary-foreground/20 pt-8 md:flex-row">
          <p className="text-sm text-secondary-foreground/60">
            2026 BuildCalc Pro. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-secondary-foreground/60 hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
