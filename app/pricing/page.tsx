import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingContent } from "@/components/pricing/pricing-content"

export const metadata = {
  title: "Pricing - BuildCalc Pro",
  description: "Simple, transparent pricing for construction professionals. Start free, upgrade when you need more.",
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <PricingContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
