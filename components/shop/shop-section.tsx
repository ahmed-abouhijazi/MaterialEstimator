"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Package, Star, TrendingUp, Zap, Hammer, Wrench, Droplet, Paintbrush, Settings } from "lucide-react"
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
  { value: "all", label: "All Categories", icon: Package, color: "bg-primary text-primary-foreground" },
  { value: "featured", label: "Featured Products", icon: Star, color: "bg-background border-2 border-border" },
  { value: "cement", label: "Cement", icon: Package, color: "bg-background border-2 border-border" },
  { value: "steel", label: "Steel & Rebar", icon: Settings, color: "bg-background border-2 border-border" },
  { value: "wood", label: "Wood & Lumber", icon: Package, color: "bg-background border-2 border-border" },
  { value: "tools", label: "Tools", icon: Hammer, color: "bg-background border-2 border-border" },
  { value: "equipment", label: "Equipment", icon: Wrench, color: "bg-background border-2 border-border" },
  { value: "pipes", label: "Pipes & Plumbing", icon: Droplet, color: "bg-background border-2 border-border" },
  { value: "wiring", label: "Wiring & Electrical", icon: Zap, color: "bg-background border-2 border-border" },
  { value: "paint", label: "Paint & Finishing", icon: Paintbrush, color: "bg-background border-2 border-border" },
]

interface ShopSectionProps {
  onCartUpdate?: () => void
}

export function ShopSection({ onCartUpdate }: ShopSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLocale()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
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
        onCartUpdate?.()
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
      
      let matchesCategory = true
      if (selectedCategory === "featured") {
        matchesCategory = product.featured
      } else if (selectedCategory !== "all") {
        matchesCategory = product.category === selectedCategory
      }
      
      return matchesSearch && matchesCategory && product.stock > 0
    })

  const featuredProducts = products.filter((p) => p.featured && p.stock > 0).slice(0, 6)

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-[#1a2332] via-[#243447] to-[#1a2332] py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Construction Materials Shop</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t("shop.title")}
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
            {t("shop.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("shop.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-32 h-14 rounded-full text-base bg-white shadow-lg border-0"
            />
            <Button
              onClick={() => {}}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-full bg-primary hover:bg-primary/90"
            >
              {t("shop.searchButton")}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Pills */}
      <div className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.value
              const categoryLabel = t(`shop.categories.${cat.value}`)

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`
                    inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-md scale-105" 
                      : "bg-muted/50 hover:bg-muted text-foreground hover:shadow-sm"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{categoryLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          {/* Stats Bar */}
          {searchQuery && (
            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  {filteredProducts.length} {t("shop.productsFound")}
                </span>
              </div>
            </div>
          )}

          {/* Products Content */}
          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("shop.loadingProducts")}</p>
              </div>
            ) : selectedCategory === "all" && searchQuery === "" ? (
                <>
                {/* Featured Products Section */}
                {featuredProducts.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <Star className="h-6 w-6 text-primary fill-primary" />
                      <h3 className="text-2xl font-bold text-secondary">
                        {t("shop.featured")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {featuredProducts.map((product) => (
                        <Card key={product.id} className="border-2 border-primary/30 hover:border-primary hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
                          <CardHeader className="p-0">
                            <div className="relative h-52 w-full bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 flex items-center justify-center overflow-hidden">
                              {product.imageUrl ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <Package className="h-20 w-20 text-primary/40 group-hover:scale-110 transition-transform" />
                              )}
                              <Badge className="absolute top-3 right-3 bg-primary shadow-lg">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            </div>
                            <div className="p-4">
                              {product.brand && (
                                <Badge variant="outline" className="mb-2 text-xs">
                                  {product.brand}
                                </Badge>
                              )}
                              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                {product.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {product.description}
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <span className="text-3xl font-bold text-primary">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">
                                  /{product.unit}
                                </span>
                              </div>
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                {t("shop.inStock")}
                              </Badge>
                            </div>
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 h-11 shadow-md hover:shadow-lg transition-all"
                              onClick={() => handleAddToCart(product.id)}
                              disabled={addingToCart === product.id}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {addingToCart === product.id ? "Adding..." : t("shop.addToCart")}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="border-t-2 border-border pt-8">
                      <h3 className="text-2xl font-bold text-secondary mb-6">
                        All Products
                      </h3>
                    </div>
                  </div>
                )}
                
                {/* All Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.filter(p => p.stock > 0).map((product) => (
                    <Card key={product.id} className="border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <CardHeader className="p-0">
                        <div className="relative h-44 w-full bg-muted flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Package className="h-16 w-16 text-muted-foreground group-hover:scale-105 transition-transform" />
                          )}
                        </div>
                        <div className="p-3">
                          {product.brand && (
                            <Badge variant="outline" className="mb-2 text-xs">
                              {product.brand}
                            </Badge>
                          )}
                          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-xl font-bold text-primary">
                              {formatPrice(product.price, product.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /{product.unit}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {t("shop.inStock")}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-secondary hover:bg-secondary/90 shadow-sm"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart === product.id}
                        >
                          <ShoppingCart className="h-3 w-3 mr-2" />
                          {addingToCart === product.id ? "Adding..." : t("shop.addToCart")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">{t("shop.noProducts")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="border-2 border-border hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="relative h-40 w-full bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>
                      {product.brand && (
                        <Badge variant="outline" className="w-fit text-xs">
                          {product.brand}
                        </Badge>
                      )}
                      <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(product.price, product.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{product.unit}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {t("shop.inStock")}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-secondary hover:bg-secondary/90"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id}
                      >
                        <ShoppingCart className="h-3 w-3 mr-2" />
                        {addingToCart === product.id ? "Adding..." : t("shop.addToCart")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
