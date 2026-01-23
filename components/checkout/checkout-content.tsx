"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Truck, CheckCircle2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    currency: string
    unit: string
  }
}

export function CheckoutContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLocale()
  const { formatPrice, convertToUserCurrency, currency: userCurrency } = useCurrency()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const [formData, setFormData] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
    shippingMethod: "standard",
    paymentMethod: "cash",
  })

  useEffect(() => {
    if (session) {
      fetchCart()
    } else {
      router.push("/login")
    }
  }, [session])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        if (data.length === 0) {
          router.push("/cart")
          return
        }
        setCartItems(data)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.postalCode ||
      !formData.country
    ) {
      toast({
        title: "Error",
        description: t("checkout.errors.fillAllFields"),
        variant: "destructive",
      })
      return
    }

    if (!formData.paymentMethod) {
      toast({
        title: "Error",
        description: t("checkout.errors.selectPayment"),
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setOrderNumber(data.orderNumber)
        setOrderPlaced(true)
        toast({
          title: t("checkout.orderSuccess"),
          description: `${t("checkout.orderNumber")}: ${data.orderNumber}`,
        })
      } else {
        throw new Error("Failed to place order")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + convertToUserCurrency(item.product.price, item.product.currency) * item.quantity,
    0
  )
  const shippingCost = formData.shippingMethod === "express" ? convertToUserCurrency(100, 'USD') : formData.shippingMethod === "standard" ? convertToUserCurrency(50, 'USD') : 0
  const total = subtotal + shippingCost

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-3xl text-secondary">
              {t("checkout.orderSuccess")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg">
                {t("checkout.orderNumber")}: <span className="font-bold text-primary">{orderNumber}</span>
              </p>
              <p className="text-muted-foreground">
                {t("checkout.confirmationEmail")}
              </p>
            </div>
            <Separator />
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t("checkout.orderSummary")}</h3>
              <div className="space-y-1 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span className="font-semibold">
                      {formatPrice(item.product.price * item.quantity, item.product.currency)}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>{t("cart.grandTotal")}</span>
                  <span className="text-primary">
                    {formatPrice(total, userCurrency)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => router.push("/dashboard")}
              >
                {t("checkout.viewOrders")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2"
                onClick={() => router.push("/shop")}
              >
                {t("cart.continueShopping")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-secondary mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          {t("checkout.title")}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t("checkout.shippingInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t("checkout.fullName")} *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("checkout.phone")} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="border-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("checkout.address")} *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="border-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("checkout.city")} *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">{t("checkout.postalCode")} *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t("checkout.country")} *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="border-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("checkout.notes")}</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="border-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>{t("checkout.shippingMethod")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.shippingMethod}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, shippingMethod: value }))
                    }
                  >
                    <div className="flex items-center space-x-2 p-3 border-2 rounded-md hover:bg-muted">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        {t("checkout.standard")} - USD 50.00
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border-2 rounded-md hover:bg-muted">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        {t("checkout.express")} - USD 100.00
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border-2 rounded-md hover:bg-muted">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        {t("checkout.pickup")} - Free
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t("checkout.paymentMethod")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <div className="flex items-center space-x-2 p-3 border-2 rounded-md hover:bg-muted">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        {t("checkout.cash")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border-2 rounded-md hover:bg-muted">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        {t("checkout.card")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border-2 rounded-md hover:bg-muted">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                        {t("checkout.bankTransfer")}
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-primary/20 sticky top-4">
                <CardHeader>
                  <CardTitle>{t("checkout.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(item.product.price * item.quantity, item.product.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span className="font-semibold">
                        {formatPrice(subtotal, userCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cart.shipping")}</span>
                      <span className="font-semibold">
                        {formatPrice(shippingCost, userCurrency)}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-secondary">{t("cart.grandTotal")}</span>
                    <span className="text-primary">
                      {formatPrice(total, userCurrency)}
                    </span>
                  </div>
                </CardContent>
                <CardContent>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                    disabled={processing}
                  >
                    {processing ? t("checkout.processing") : t("checkout.placeOrder")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
