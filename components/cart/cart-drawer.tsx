"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/lib/locale-context"
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

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCartUpdate?: () => void
}

export function CartDrawer({ open, onOpenChange, onCartUpdate }: CartDrawerProps) {
  const router = useRouter()
  const { t } = useLocale()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCart()
    }
  }, [open])

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
        onCartUpdate?.()
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
        onCartUpdate?.()
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

  const goToCheckout = () => {
    onOpenChange(false)
    router.push("/checkout")
  }

  const viewFullCart = () => {
    onOpenChange(false)
    router.push("/cart")
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const shipping = subtotal > 0 ? 50 : 0
  const total = subtotal + shipping

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-b from-primary/5 to-transparent">
          <SheetTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            {t("cart.title")}
          </SheetTitle>
          <SheetDescription className="text-base pt-1">
            {cartItems.length} {cartItems.length === 1 ? t("cart.itemInCart") : t("cart.itemsInCart")}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12 px-6">
            <div className="bg-muted/50 p-8 rounded-full">
              <Package className="h-20 w-20 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">{t("cart.emptyCart")}</p>
              <p className="text-sm text-muted-foreground">Add items to get started</p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90" size="lg">
              {t("cart.continueShopping")}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="group relative flex gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-card hover:border-primary/20">
                    <div className="relative h-24 w-24 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="font-semibold text-base line-clamp-2 pr-2">
                        {item.product.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg text-primary font-bold">
                          {item.product.currency} {item.product.price.toFixed(2)}
                        </p>
                        <span className="text-xs text-muted-foreground">per {item.product.unit}</span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center bg-muted rounded-lg border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id || item.quantity <= 1}
                            className="h-8 w-8 p-0 hover:bg-muted-foreground/10 rounded-l-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id || item.quantity >= item.product.stock}
                            className="h-8 w-8 p-0 hover:bg-muted-foreground/10 rounded-r-lg"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="text-base font-bold">
                        {item.product.currency} {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t bg-gradient-to-t from-muted/20 to-transparent px-6 py-5 space-y-5">
              <div className="space-y-3 bg-card rounded-lg p-4 border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span className="font-semibold">
                    {cartItems[0]?.product.currency || "USD"} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.shipping")}</span>
                  <span className="font-semibold">
                    {cartItems[0]?.product.currency || "USD"} {shipping.toFixed(2)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{t("cart.grandTotal")}</span>
                  <span className="text-xl font-bold text-primary">
                    {cartItems[0]?.product.currency || "USD"} {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={goToCheckout}
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t("cart.proceedToCheckout")}
                </Button>
                <Button
                  onClick={viewFullCart}
                  variant="outline"
                  className="w-full border-2 hover:bg-muted"
                  size="lg"
                >
                  View Full Cart
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
