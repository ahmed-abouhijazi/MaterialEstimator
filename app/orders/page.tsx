import { Metadata } from "next"
import { OrdersContent } from "@/components/orders/orders-content"

export const metadata: Metadata = {
  title: "My Orders | BuildCalc Pro",
  description: "View and manage your construction material orders",
}

export default function OrdersPage() {
  return <OrdersContent />
}
