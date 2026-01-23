"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Search, Package, Star, TrendingUp, Zap } from "lucide-react"
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
  { value: "all", label: "All Products", icon: Package },
  { value: "featured", label: "Featured", icon: Star },
  { value: "cement", label: "Cement", icon: Package },
  { value: "steel", label: "Steel & Rebar", icon: Package },
  { value: "wood", label: "Wood", icon: Package },
  { value: "tools", label: "Tools", icon: Package },
  { value: "equipment", label: "Equipment", icon: Package },
  { value: "pipes", label: "Pipes", icon: Package },
  { value: "wiring", label: "Wiring", icon: Zap },
  { value: "paint", label: "Paint", icon: Package },
]

interface ShopSectionProps {
  onCartUpdate?: () => void
}

export function ShopSection({ onCartUpdate }: ShopSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLocale()
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Construction Materials Shop
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t("shop.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("shop.subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t("shop.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 border-input focus:border-primary"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-muted/50 p-2 mb-8">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {t(`shop.${cat.value === "featured" ? "featured" : cat.value === "all" ? "allCategories" : cat.value}`) || cat.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
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
                        <Card key={product.id} className="border-2 border-primary/20 hover:shadow-xl transition-all hover:-translate-y-1">
                          <CardHeader>
                            <div className="relative h-48 w-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                              {product.imageUrl ? (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="h-20 w-20 text-primary/40" />
                              )}
                              <Badge className="absolute top-2 right-2 bg-primary">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            </div>
                            {product.brand && (
                              <Badge variant="outline" className="w-fit mb-2">
                                {product.brand}
                              </Badge>
                            )}
                            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {product.description}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-end justify-between mb-3">
                              <div>
                                <span className="text-3xl font-bold text-primary">
                                  {product.currency} {product.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">
                                  /{product.unit}
                                </span>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {t("shop.inStock")}
                              </Badge>
                            </div>
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 h-11"
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
                              {product.currency} {product.price.toFixed(2)}
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
                            {product.currency} {product.price.toFixed(2)}
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
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
