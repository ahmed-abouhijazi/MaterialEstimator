"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calculator, FileText, Share2, CheckCircle, Ruler, MapPin, Zap } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function HowItWorksContent() {
  const { t } = useLocale()

  const steps = [
    {
      icon: Ruler,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      details: [
        t('howItWorks.step1.detail1'),
        t('howItWorks.step1.detail2'),
        t('howItWorks.step1.detail3'),
        t('howItWorks.step1.detail4'),
      ],
    },
    {
      icon: Calculator,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      details: [
        t('howItWorks.step2.detail1'),
        t('howItWorks.step2.detail2'),
        t('howItWorks.step2.detail3'),
        t('howItWorks.step2.detail4'),
      ],
    },
    {
      icon: FileText,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      details: [
        t('howItWorks.step3.detail1'),
        t('howItWorks.step3.detail2'),
        t('howItWorks.step3.detail3'),
        t('howItWorks.step3.detail4'),
      ],
    },
    {
      icon: Share2,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      details: [
        t('howItWorks.step4.detail1'),
        t('howItWorks.step4.detail2'),
        t('howItWorks.step4.detail3'),
        t('howItWorks.step4.detail4'),
      ],
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: t('howItWorks.benefit1Title'),
      description: t('howItWorks.benefit1Desc'),
    },
    {
      icon: CheckCircle,
      title: t('howItWorks.benefit2Title'),
      description: t('howItWorks.benefit2Desc'),
    },
    {
      icon: MapPin,
      title: t('howItWorks.benefit3Title'),
      description: t('howItWorks.benefit3Desc'),
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-bold text-secondary md:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
              {t('howItWorks.title')}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {t('howItWorks.subtitle')}
            </p>
            <Link href="/estimator">
              <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                {t('howItWorks.tryNow')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col gap-6 md:flex-row md:gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-3 text-xl font-bold text-secondary md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {step.title}
                  </h2>
                  <p className="mb-4 text-muted-foreground">{step.description}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-secondary">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formula Approach */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border-2 border-secondary bg-secondary p-8 text-secondary-foreground md:p-12">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                {t('howItWorks.formulaTitle')}
              </h2>
              <p className="mb-6 text-secondary-foreground/80">
                {t('howItWorks.formulaSubtitle')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                  <CardContent className="pt-6">
                    <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {t('howItWorks.consistentTitle')}
                    </h3>
                    <p className="text-sm text-secondary-foreground/70">
                      {t('howItWorks.consistentDesc')}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                  <CardContent className="pt-6">
                    <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {t('howItWorks.industryTitle')}
                    </h3>
                    <p className="text-sm text-secondary-foreground/70">
                      {t('howItWorks.industryDesc')}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                  <CardContent className="pt-6">
                    <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {t('howItWorks.verifiableTitle')}
                    </h3>
                    <p className="text-sm text-secondary-foreground/70">
                      {t('howItWorks.verifiableDesc')}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                  <CardContent className="pt-6">
                    <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {t('howItWorks.safetyTitle')}
                    </h3>
                    <p className="text-sm text-secondary-foreground/70">
                      {t('howItWorks.safetyDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-secondary md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            {t('howItWorks.benefitsTitle')}
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 border-border text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <benefit.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-secondary md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
              {t('howItWorks.ctaTitle')}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {t('howItWorks.ctaSubtitle')}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/estimator">
                <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('howItWorks.ctaButton')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-12 border-2 border-secondary text-secondary bg-transparent">
                  {t('howItWorks.viewPricing')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
