"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShopSection } from "@/components/shop/shop-section"

export default function ShopPage() {
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0)

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header key={cartUpdateTrigger} />
      <main className="flex-1">
        <ShopSection onCartUpdate={handleCartUpdate} />
      </main>
      <Footer />
    </div>
  )
}
