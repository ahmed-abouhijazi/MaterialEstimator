import { Metadata } from "next"
import { ShopContent } from "@/components/shop/shop-content"

export const metadata: Metadata = {
  title: "Construction Materials Shop | BuildCalc Pro",
  description: "Buy quality construction materials directly for your projects. Browse cement, steel, wood, tools, and more.",
}

export default function ShopPage() {
  return <ShopContent />
}
