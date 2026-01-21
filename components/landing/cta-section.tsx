import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl border-2 border-secondary bg-secondary p-8 text-center md:p-12">
          <h2 className="mb-4 text-balance text-3xl font-bold text-secondary-foreground md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to Stop Guessing?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-pretty text-secondary-foreground/80">
            Start your first estimate for free. No credit card required. See exactly what materials you need for your next project.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/estimator">
              <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                Create Free Estimate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 bg-transparent">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
