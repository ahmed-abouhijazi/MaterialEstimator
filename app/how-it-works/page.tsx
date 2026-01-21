import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calculator, FileText, Share2, CheckCircle, Ruler, MapPin, Zap } from "lucide-react"

export const metadata = {
  title: "How It Works - BuildCalc Pro",
  description: "Learn how BuildCalc Pro helps you estimate construction materials with accuracy and speed.",
}

const steps = [
  {
    icon: Ruler,
    title: "1. Enter Your Project Details",
    description: "Select your project type (house, room, wall, roof, etc.), enter the dimensions in meters, choose your location, and select a quality level (basic, standard, or premium).",
    details: [
      "Support for 7 project types",
      "Dimensions in metric (meters)",
      "Location-based pricing",
      "3 quality tiers to choose from",
    ],
  },
  {
    icon: Calculator,
    title: "2. We Calculate Everything",
    description: "Our formula engine uses industry-standard construction math to calculate exact quantities for every material you need. No AI guessing - just proven formulas.",
    details: [
      "Cement, sand, gravel quantities",
      "Steel reinforcement calculations",
      "Roofing and finishing materials",
      "Electrical and plumbing estimates",
    ],
  },
  {
    icon: FileText,
    title: "3. Review Your Estimate",
    description: "Get a detailed breakdown of all materials, quantities, unit prices, and total costs. Every estimate includes a 10-15% waste buffer so you never run short.",
    details: [
      "Itemized material list",
      "Category-based organization",
      "Built-in waste buffer",
      "Clear cost breakdown",
    ],
  },
  {
    icon: Share2,
    title: "4. Export & Share",
    description: "Download your estimate as a professional PDF report or share it directly with suppliers and team members via WhatsApp, email, or link.",
    details: [
      "Print-ready PDF reports",
      "WhatsApp sharing",
      "Email directly to suppliers",
      "Save to your dashboard",
    ],
  },
]

const benefits = [
  {
    icon: Zap,
    title: "Save Hours of Work",
    description: "What used to take hours of manual calculations now takes less than 2 minutes.",
  },
  {
    icon: CheckCircle,
    title: "Reduce Material Waste",
    description: "Accurate estimates mean you order exactly what you need, reducing waste and costs.",
  },
  {
    icon: MapPin,
    title: "Location-Aware Pricing",
    description: "Get realistic cost estimates based on your region's material prices.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-3xl font-bold text-secondary md:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                How BuildCalc Pro Works
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                From project details to material list in minutes. No complex software, no learning curve.
              </p>
              <Link href="/estimator">
                <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                  Try It Now - Free
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
                  Formula-Based, Not AI Guessing
                </h2>
                <p className="mb-6 text-secondary-foreground/80">
                  Unlike other tools that use AI to &quot;estimate&quot; quantities, BuildCalc Pro uses deterministic formulas 
                  based on established construction standards. This means:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                    <CardContent className="pt-6">
                      <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Consistent Results</h3>
                      <p className="text-sm text-secondary-foreground/70">
                        Same inputs always produce the same outputs. No random variations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                    <CardContent className="pt-6">
                      <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Industry Standards</h3>
                      <p className="text-sm text-secondary-foreground/70">
                        Calculations follow established construction math used by engineers.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                    <CardContent className="pt-6">
                      <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Verifiable Accuracy</h3>
                      <p className="text-sm text-secondary-foreground/70">
                        You can verify every calculation against manual methods.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-secondary-foreground/20 bg-secondary-foreground/5">
                    <CardContent className="pt-6">
                      <h3 className="mb-2 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Built-In Safety</h3>
                      <p className="text-sm text-secondary-foreground/70">
                        Waste buffer automatically added to prevent material shortages.
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
              Why Contractors Choose BuildCalc Pro
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
                Ready to Get Started?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Create your first estimate for free. No credit card required.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/estimator">
                  <Button size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Free Estimate
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="h-12 border-2 border-secondary text-secondary bg-transparent">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
