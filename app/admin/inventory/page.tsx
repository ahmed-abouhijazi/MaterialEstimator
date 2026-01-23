"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  PackagePlus,
  PackageMinus,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

// Product categories
const categories = [
  { id: "CONCRETE", name: "Béton" },
  { id: "STEEL", name: "Acier" },
  { id: "WOOD", name: "Bois" },
  { id: "INSULATION", name: "Isolation" },
  { id: "ROOFING", name: "Toiture" },
  { id: "PAINT", name: "Peinture" },
  { id: "PLUMBING", name: "Plomberie" },
  { id: "ELECTRICAL", name: "Électricité" },
  { id: "FLOORING", name: "Revêtement de sol" },
  { id: "OTHER", name: "Autre" },
]

const InventoryPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const filteredProducts = products.filter((product) => {
    if (categoryFilter !== "all" && product.category !== categoryFilter) {
      return false
    }
    if (stockFilter === "ok" && product.stock < product.minStock) {
      return false
    }
    if (stockFilter === "low" && product.stock >= product.minStock) {
      return false
    }
    if (stockFilter === "out" && product.stock > 0) {
      return false
    }
    const searchLower = searchQuery.toLowerCase()
    return product.name?.toLowerCase().includes(searchLower) || 
           product.sku?.toLowerCase().includes(searchLower) ||
           product.description?.toLowerCase().includes(searchLower)
  })

  const getStockStatus = (product: any) => {
    if (product.stock === 0) {
      return { label: "Rupture", className: "bg-red-500/10 text-red-400 border-red-500/20" }
    }
    if (product.stock < (product.minStock || 10)) {
      return { label: "Stock faible", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
    }
    return { label: "En stock", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
  }

  const lowStockCount = products.filter((p) => p.stock < (p.minStock || 10) && p.stock > 0).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  const handleOpenEditDialog = (product: any) => {
    setSelectedProduct(product)
    setImagePreview(product.imageUrl || "")
    setImageFile(null)
    setIsEditDialogOpen(true)
  }

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false)
    setImagePreview("")
    setImageFile(null)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setImagePreview("")
    setImageFile(null)
    setSelectedProduct(null)
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Inventaire</h1>
            <p className="text-slate-400">Gérez vos produits et votre stock</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseAddDialog()
            else setIsAddDialogOpen(true)
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Remplissez les informations du nouveau produit
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Image du produit</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-700">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-800/50">
                          <ImageIcon className="h-12 w-12 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="add-image-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            {imagePreview ? 'Changer l\'image' : 'Télécharger une image'}
                          </span>
                        </div>
                        <input
                          id="add-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-slate-500 mt-2">PNG, JPG ou WEBP (max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nom du produit</Label>
                    <Input
                      placeholder="Ex: Ciment Portland CEM I"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">SKU</Label>
                    <Input
                      placeholder="Ex: CIM-001"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea
                    placeholder="Description du produit..."
                    className="bg-slate-800/50 border-slate-700 text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Prix (MAD)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Unité</Label>
                    <Input
                      placeholder="Ex: sac 50kg"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Catégorie</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-slate-800">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Stock initial</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Stock minimum</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Stock maximum</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseAddDialog} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Annuler
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  Ajouter le produit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseEditDialog()
            else setIsEditDialogOpen(true)
          }}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier le produit</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Modifiez les informations du produit
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Image du produit</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {imagePreview || selectedProduct?.imageUrl ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-700">
                          <img
                            src={imagePreview || selectedProduct?.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-800/50">
                          <ImageIcon className="h-12 w-12 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            {imagePreview || selectedProduct?.imageUrl ? 'Changer l\'image' : 'Télécharger une image'}
                          </span>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-slate-500 mt-2">PNG, JPG ou WEBP (max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nom du produit</Label>
                    <Input
                      defaultValue={selectedProduct?.name}
                      placeholder="Ex: Ciment Portland CEM I"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">SKU</Label>
                    <Input
                      defaultValue={selectedProduct?.sku}
                      placeholder="Ex: CIM-001"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea
                    defaultValue={selectedProduct?.description}
                    placeholder="Description du produit..."
                    className="bg-slate-800/50 border-slate-700 text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Prix (MAD)</Label>
                    <Input
                      type="number"
                      defaultValue={selectedProduct?.price}
                      placeholder="0.00"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Unité</Label>
                    <Input
                      defaultValue={selectedProduct?.unit}
                      placeholder="Ex: sac 50kg"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Catégorie</Label>
                    <Select defaultValue={selectedProduct?.category}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-slate-800">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Stock actuel</Label>
                    <Input
                      type="number"
                      defaultValue={selectedProduct?.stock}
                      placeholder="0"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Stock minimum</Label>
                    <Input
                      type="number"
                      defaultValue={selectedProduct?.minStock}
                      placeholder="5"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Stock maximum</Label>
                    <Input
                      type="number"
                      defaultValue={selectedProduct?.maxStock}
                      placeholder="100"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseEditDialog} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Annuler
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  Enregistrer les modifications
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                  <p className="text-xs text-slate-500">Produits total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{products.length - lowStockCount - outOfStockCount}</p>
                  <p className="text-xs text-slate-500">En stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{lowStockCount}</p>
                  <p className="text-xs text-slate-500">Stock faible</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{outOfStockCount}</p>
                  <p className="text-xs text-slate-500">Rupture de stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Rechercher par nom ou SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
                    <Filter className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all" className="text-white focus:bg-slate-800">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-slate-800">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all" className="text-white focus:bg-slate-800">Tout le stock</SelectItem>
                    <SelectItem value="ok" className="text-white focus:bg-slate-800">En stock</SelectItem>
                    <SelectItem value="low" className="text-white focus:bg-slate-800">Stock faible</SelectItem>
                    <SelectItem value="out" className="text-white focus:bg-slate-800">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Liste des produits</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Produit</TableHead>
                    <TableHead className="text-slate-400">SKU</TableHead>
                    <TableHead className="text-slate-400">Catégorie</TableHead>
                    <TableHead className="text-slate-400">
                      <div className="flex items-center gap-1">
                        Prix
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-400">
                      <div className="flex items-center gap-1">
                        Stock
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-400">Statut</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product)
                    return (
                      <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                              <Package className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.unit}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="text-slate-300">{product.category?.name}</TableCell>
                        <TableCell className="text-white font-medium">{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{product.stock}</span>
                            <span className="text-slate-500 text-sm">/ {product.minStock} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                              <DropdownMenuLabel className="text-slate-400">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-800" />
                              <DropdownMenuItem 
                                className="text-white focus:bg-slate-800"
                                onClick={() => handleOpenEditDialog(product)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-white focus:bg-slate-800"
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setIsStockDialogOpen(true)
                                }}
                              >
                                <PackagePlus className="h-4 w-4 mr-2" />
                                Ajuster le stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-800" />
                              <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Stock Adjustment Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Ajuster le stock</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center gap-8 p-4 rounded-lg bg-slate-800/50">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{selectedProduct?.stock}</p>
                  <p className="text-xs text-slate-500">Stock actuel</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 bg-transparent">
                  <PackagePlus className="h-6 w-6" />
                  Entrée de stock
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent">
                  <PackageMinus className="h-6 w-6" />
                  Sortie de stock
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Quantité</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-slate-800/50 border-slate-700 text-white text-center text-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Raison (optionnel)</Label>
                <Textarea
                  placeholder="Ex: Réception fournisseur, Correction inventaire..."
                  className="bg-slate-800/50 border-slate-700 text-white resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStockDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Annuler
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default InventoryPage
