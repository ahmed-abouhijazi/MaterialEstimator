"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, ShoppingBag, Truck, CheckCircle2, XCircle, Clock, Eye } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  shippingAddress: string
  shippingMethod: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  orderItems: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      unit: string
    }
  }[]
}

export function OrdersContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLocale()
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (session) {
      fetchOrders()
    } else {
      router.push("/login")
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      processing: "default",
      shipped: "secondary",
      delivered: "default",
      cancelled: "destructive",
    }
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {t(`orders.${status}`)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">{t("orders.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 py-12">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  {t("orders.noOrders")}
                </h3>
                <p className="text-muted-foreground">
                  Browse our shop and start ordering construction materials
                </p>
              </div>
            </CardContent>
            <CardContent>
              <Link href="/shop">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  {t("orders.startShopping")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t("orders.title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("orders.orderHistory")}</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const shippingAddr = JSON.parse(order.shippingAddress)
            return (
              <Card key={order.id} className="border-2 border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-xl">
                          {t("orders.orderNumber")}{order.orderNumber}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(order.totalAmount, order.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("orders.shippingAddress")}
                      </p>
                      <p className="text-sm font-medium">
                        {shippingAddr.fullName}<br />
                        {shippingAddr.address}<br />
                        {shippingAddr.city}, {shippingAddr.postalCode}<br />
                        {shippingAddr.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("orders.paymentMethod")}
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {t(`checkout.${order.paymentMethod}`)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 mb-1">
                        {t("orders.paymentStatus")}
                      </p>
                      <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                        {t(`orders.${order.paymentStatus === "paid" ? "paid" : "unpaid"}`)}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 mb-4">
                    <p className="font-semibold text-sm">{t("checkout.orderSummary")}</p>
                    {order.orderItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(item.price * item.quantity, order.currency)}
                        </span>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.orderItems.length - 3} more items
                      </p>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-2" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t("orders.viewDetails")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          {t("orders.orderDetails")}
                        </DialogTitle>
                        <DialogDescription>
                          {t("orders.orderNumber")}{order.orderNumber}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-3">{t("checkout.orderSummary")}</h3>
                          <div className="space-y-2">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between p-2 bg-muted rounded">
                                <div>
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.quantity} x {formatPrice(item.price, order.currency)} / {item.product.unit}
                                  </p>
                                </div>
                                <p className="font-bold">
                                  {formatPrice(item.price * item.quantity, order.currency)}
                                </p>
                              </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                              <span>{t("cart.grandTotal")}</span>
                              <span className="text-primary">
                                {formatPrice(order.totalAmount, order.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button variant="outline" size="lg" className="border-2">
              {t("cart.continueShopping")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
