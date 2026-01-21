"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calculator, FileText, TrendingUp } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { formatCurrency as formatCurrencyUtil } from "@/lib/currency"

export function HeroSection() {
  const { t, currency } = useLocale()

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a5f10_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-secondary bg-card px-4 py-2">
            <span className="text-sm font-medium text-secondary">{t('hero.badge')}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-secondary md:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
            {t('hero.title')}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/estimator">
              <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent">
                {t('hero.seeHowItWorks')}
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('hero.formulaAccuracy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('hero.pdfExport')}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('hero.wasteBuffer')}</span>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-xl border-2 border-secondary bg-card p-6 shadow-lg md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                {t('hero.sampleEstimate')}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {t('hero.houseSize')}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border-2 border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">{t('hero.cementBags')}</p>
                <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>385</p>
              </div>
              <div className="rounded-lg border-2 border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">{t('hero.steelBars')}</p>
                <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>4.2</p>
              </div>
              <div className="rounded-lg border-2 border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">{t('hero.estimatedCost')}</p>
                <p className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrencyUtil(45800, currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
