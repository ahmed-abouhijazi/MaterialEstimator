"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Package, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  currency: string
  unit: string
  imageUrl?: string
  stock: number
  brand?: string
  featured: boolean
}

const categories = [
  "all",
  "cement",
  "steel",
  "wood",
  "tools",
  "equipment",
  "pipes",
  "wiring",
  "paint",
  "other",
]

export function ShopContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLocale()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      router.push("/login")
      return
    }

    setAddingToCart(productId)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (response.ok) {
        toast({
          title: t("cart.addedToCart"),
          description: "Product added to your cart successfully",
        })
      } else {
        throw new Error("Failed to add to cart")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory && product.stock > 0
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return a.price - b.price
        case "priceHigh":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const featuredProducts = products.filter((p) => p.featured && p.stock > 0).slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-secondary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t("shop.title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("shop.subtitle")}</p>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {t("shop.featured")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="border-2 border-primary/20 bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="relative h-40 w-full bg-muted rounded-md mb-2 flex items-center justify-center">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <Badge className="w-fit bg-primary">{t("shop.featured")}</Badge>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{product.unit}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {addingToCart === product.id ? "Adding..." : t("shop.addToCart")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("shop.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-input"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] border-2">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("shop.categories")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`shop.${cat === "all" ? "allCategories" : cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] border-2">
                <SelectValue placeholder={t("shop.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("shop.sortNewest")}</SelectItem>
                <SelectItem value="priceLow">{t("shop.sortPriceLowHigh")}</SelectItem>
                <SelectItem value="priceHigh">{t("shop.sortPriceHighLow")}</SelectItem>
                <SelectItem value="name">{t("shop.sortName")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("shop.loadingProducts")}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{t("shop.noProducts")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-2 border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="relative h-40 w-full bg-muted rounded-md mb-2 flex items-center justify-center">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  {product.brand && (
                    <Badge variant="outline" className="w-fit">
                      {product.brand}
                    </Badge>
                  )}
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        /{product.unit}
                      </span>
                    </div>
                    <Badge variant={product.stock > 10 ? "default" : "secondary"}>
                      {t("shop.inStock")}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addingToCart === product.id ? "Adding..." : t("shop.addToCart")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
