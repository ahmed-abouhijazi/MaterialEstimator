"use client"

import { useState } from "react"
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
} from "lucide-react"
import { products, categories } from "@/lib/admin/mock-data"
import type { Product } from "@/lib/admin/types"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

const InventoryPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

  const filteredProducts = products.filter((product) => {
    if (categoryFilter !== "all" && product.category?.id !== categoryFilter) {
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
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Rupture", className: "bg-red-500/10 text-red-400 border-red-500/20" }
    }
    if (product.stock < product.minStock) {
      return { label: "Stock faible", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
    }
    return { label: "En stock", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
  }

  const lowStockCount = products.filter((p) => p.stock < p.minStock && p.stock > 0).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Inventaire</h1>
            <p className="text-slate-400">Gérez vos produits et votre stock</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Annuler
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  Ajouter le produit
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
                              <DropdownMenuItem className="text-white focus:bg-slate-800">
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
