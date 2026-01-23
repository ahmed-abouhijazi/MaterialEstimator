import { Metadata } from "next"
import { CheckoutContent } from "@/components/checkout/checkout-content"

export const metadata: Metadata = {
  title: "Checkout | BuildCalc Pro",
  description: "Complete your purchase of construction materials",
}

export default function CheckoutPage() {
  return <CheckoutContent />
}
