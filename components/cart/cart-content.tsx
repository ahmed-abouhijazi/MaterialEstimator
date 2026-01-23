"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    unit: string
    imageUrl?: string
    stock: number
  }
}

export function CartContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLocale()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        )
        toast({
          title: t("cart.cartUpdated"),
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId))
        toast({
          title: t("cart.removedFromCart"),
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
      })

      if (response.ok) {
        setCartItems([])
        toast({
          title: "Cart cleared",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center">{t("cart.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Please sign in to view your cart
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const shipping = subtotal > 0 ? 50 : 0 // Example shipping cost
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">{t("cart.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 py-12">
              <Package className="h-24 w-24 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  {t("cart.emptyCart")}
                </h3>
                <p className="text-muted-foreground">
                  Start adding construction materials to your cart
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/shop" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("cart.continueShopping")}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/shop">
            <Button variant="ghost" className="text-secondary hover:text-secondary/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("cart.backToShop")}
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-secondary mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          {t("cart.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-2 border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-secondary mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.product.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-primary">
                          {item.product.currency} {item.product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{item.product.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 border-2 border-border rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            updating === item.id ||
                            item.quantity >= item.product.stock
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-lg font-bold text-secondary">
                        {item.product.currency}{" "}
                        {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={clearCart}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("cart.clearCart")}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl">{t("checkout.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span className="font-semibold">
                    {cartItems[0]?.product.currency || "USD"} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">{t("cart.shipping")}</span>
                  <span className="font-semibold">
                    {cartItems[0]?.product.currency || "USD"} {shipping.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-secondary">{t("cart.grandTotal")}</span>
                  <span className="text-primary text-2xl">
                    {cartItems[0]?.product.currency || "USD"} {total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? t("cart.itemInCart") : t("cart.itemsInCart")}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t("cart.proceedToCheckout")}
                  </Button>
                </Link>
                <Link href="/shop" className="w-full">
                  <Button variant="outline" className="w-full border-2">
                    {t("cart.continueShopping")}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
