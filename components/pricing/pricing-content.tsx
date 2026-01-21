"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Minus } from "lucide-react"

const plans = [
  {
    name: "Free",
    description: "For occasional estimates",
    price: { monthly: 0, yearly: 0 },
    features: [
      { text: "1 estimate per month", included: true },
      { text: "Basic material calculations", included: true },
      { text: "PDF export", included: true },
      { text: "Email sharing", included: true },
      { text: "Project history", included: false },
      { text: "Priority support", included: false },
      { text: "Team collaboration", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started",
    href: "/estimator",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For active contractors",
    price: { monthly: 49, yearly: 39 },
    features: [
      { text: "Unlimited estimates", included: true },
      { text: "Advanced material calculations", included: true },
      { text: "PDF export", included: true },
      { text: "WhatsApp & email sharing", included: true },
      { text: "Project history (1 year)", included: true },
      { text: "Priority support", included: true },
      { text: "Team collaboration", included: false },
      { text: "API access", included: false },
    ],
    cta: "Start Pro Trial",
    href: "/estimator",
    highlighted: true,
  },
  {
    name: "Contractor",
    description: "For teams & businesses",
    price: { monthly: 199, yearly: 159 },
    features: [
      { text: "Unlimited estimates", included: true },
      { text: "Premium material calculations", included: true },
      { text: "Branded PDF export", included: true },
      { text: "All sharing options", included: true },
      { text: "Unlimited project history", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Team collaboration (5 users)", included: true },
      { text: "API access", included: true },
    ],
    cta: "Contact Sales",
    href: "/estimator",
    highlighted: false,
  },
]

const faqs = [
  {
    question: "Can I try before I buy?",
    answer: "Absolutely! Our Free plan lets you create 1 estimate per month with no credit card required. You can upgrade anytime when you need more.",
  },
  {
    question: "How accurate are the estimates?",
    answer: "Our calculations use industry-standard formulas, not AI guessing. Estimates are typically within 5-10% of actual material requirements for standard construction projects.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period, and your saved projects remain accessible.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days of purchase for a full refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal. Enterprise customers can also pay by invoice.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption for all data transmission and storage. Your project data is never shared with third parties.",
  },
]

export function PricingContent() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-secondary md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Choose the plan that fits your needs. Start free, upgrade when you&apos;re ready.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm ${billingCycle === "monthly" ? "font-semibold text-secondary" : "text-muted-foreground"}`}>
            Monthly
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
            Yearly
            <span className="ml-1 text-xs text-primary">(Save 20%)</span>
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
                  Most Popular
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
                  ${plan.price[billingCycle]}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground">/month</span>
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
          Need a Custom Solution?
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-secondary-foreground/80">
          For large construction companies with specific requirements, we offer custom enterprise solutions with dedicated support, custom integrations, and volume pricing.
        </p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Contact Sales
        </Button>
      </div>

      {/* FAQs */}
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
          Frequently Asked Questions
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
          Still have questions? We&apos;re here to help.
        </p>
        <Button variant="outline" className="border-2 border-secondary text-secondary bg-transparent">
          Contact Support
        </Button>
      </div>
    </div>
  )
}
