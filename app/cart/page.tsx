import { Metadata } from "next"
import { CartContent } from "@/components/cart/cart-content"

export const metadata: Metadata = {
  title: "Shopping Cart | BuildCalc Pro",
  description: "Review your construction materials and proceed to checkout",
}

export default function CartPage() {
  return <CartContent />
}
