"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Minus } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { formatCurrency } from "@/lib/currency"

export function PricingContent() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { t, currency } = useLocale()

  const plans = [
    {
      name: t('pricing.free.name'),
      description: t('pricing.free.description'),
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: t('pricing.free.feature1'), included: true },
        { text: t('pricing.free.feature2'), included: true },
        { text: t('pricing.free.feature3'), included: true },
        { text: t('pricing.free.feature4'), included: true },
        { text: t('pricing.free.feature5'), included: false },
        { text: t('pricing.free.feature6'), included: false },
        { text: t('pricing.free.feature7'), included: false },
        { text: t('pricing.free.feature8'), included: false },
      ],
      cta: t('pricing.free.cta'),
      href: "/estimator",
      highlighted: false,
    },
    {
      name: t('pricing.pro.name'),
      description: t('pricing.pro.description'),
      price: { monthly: 49, yearly: 39 },
      features: [
        { text: t('pricing.pro.feature1'), included: true },
        { text: t('pricing.pro.feature2'), included: true },
        { text: t('pricing.pro.feature3'), included: true },
        { text: t('pricing.pro.feature4'), included: true },
        { text: t('pricing.pro.feature5'), included: true },
        { text: t('pricing.pro.feature6'), included: true },
        { text: t('pricing.pro.feature7'), included: false },
        { text: t('pricing.pro.feature8'), included: false },
      ],
      cta: t('pricing.pro.cta'),
      href: "/estimator",
      highlighted: true,
    },
    {
      name: t('pricing.contractor.name'),
      description: t('pricing.contractor.description'),
      price: { monthly: 199, yearly: 159 },
      features: [
        { text: t('pricing.contractor.feature1'), included: true },
        { text: t('pricing.contractor.feature2'), included: true },
        { text: t('pricing.contractor.feature3'), included: true },
        { text: t('pricing.contractor.feature4'), included: true },
        { text: t('pricing.contractor.feature5'), included: true },
        { text: t('pricing.contractor.feature6'), included: true },
        { text: t('pricing.contractor.feature7'), included: true },
        { text: t('pricing.contractor.feature8'), included: true },
      ],
      cta: t('pricing.contractor.cta'),
      href: "/estimator",
      highlighted: false,
    },
  ]

  const faqs = [
    {
      question: t('pricing.faq.q1'),
      answer: t('pricing.faq.a1'),
    },
    {
      question: t('pricing.faq.q2'),
      answer: t('pricing.faq.a2'),
    },
    {
      question: t('pricing.faq.q3'),
      answer: t('pricing.faq.a3'),
    },
    {
      question: t('pricing.faq.q4'),
      answer: t('pricing.faq.a4'),
    },
    {
      question: t('pricing.faq.q5'),
      answer: t('pricing.faq.a5'),
    },
    {
      question: t('pricing.faq.q6'),
      answer: t('pricing.faq.a6'),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-secondary md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('pricing.title')}
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          {t('pricing.subtitle')}
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm ${billingCycle === "monthly" ? "font-semibold text-secondary" : "text-muted-foreground"}`}>
            {t('pricing.monthly')}
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative h-7 w-14 rounded-full bg-secondary transition-colors"
            aria-label="Toggle billing cycle"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-primary transition-all ${
                billingCycle === "yearly" ? "left-8" : "left-1"
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === "yearly" ? "font-semibold text-secondary" : "text-muted-foreground"}`}>
            {t('pricing.yearly')}
            <span className="ml-1 text-xs text-primary">{t('pricing.savePercent')}</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative border-2 ${
              plan.highlighted
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  {t('pricing.mostPopular')}
                </span>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="mb-6">
                <span className="text-4xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                  {formatCurrency(plan.price[billingCycle], currency)}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={feature.included ? "text-secondary" : "text-muted-foreground/50"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={plan.href} className="w-full">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Enterprise */}
      <div className="mb-16 rounded-xl border-2 border-secondary bg-secondary p-8 text-center text-secondary-foreground md:p-12">
        <h2 className="mb-2 text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {t('pricing.enterprise.title')}
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-secondary-foreground/80">
          {t('pricing.enterprise.subtitle')}
        </p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          {t('pricing.enterprise.cta')}
        </Button>
      </div>

      {/* FAQs */}
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
          {t('pricing.faq.title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-lg border-2 border-border bg-card p-5">
              <h3 className="mb-2 font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                {faq.question}
              </h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="mb-4 text-muted-foreground">
          {t('pricing.support.question')}
        </p>
        <Button variant="outline" className="border-2 border-secondary text-secondary bg-transparent">
          {t('pricing.support.cta')}
        </Button>
      </div>
    </div>
  )
}
