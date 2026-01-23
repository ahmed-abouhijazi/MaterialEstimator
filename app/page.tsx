"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { ShopSection } from "@/components/shop/shop-section"

export default function HomePage() {
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0)

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header key={cartUpdateTrigger} />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ShopSection onCartUpdate={handleCartUpdate} />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
