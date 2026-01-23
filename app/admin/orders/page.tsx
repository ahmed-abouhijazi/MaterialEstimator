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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Filter,
  ShoppingCart,
  Clock,
  Package,
  CreditCard,
  MapPin,
  Calendar,
} from "lucide-react"
import { orders } from "@/lib/admin/mock-data"
import type { Order, OrderStatus } from "@/lib/admin/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const statusConfig: Record<OrderStatus, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmée", className: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle },
  PROCESSING: { label: "En préparation", className: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Package },
  SHIPPED: { label: "Expédiée", className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: Truck },
  DELIVERED: { label: "Livrée", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  CANCELLED: { label: "Annulée", className: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
}

const paymentStatusConfig = {
  PENDING: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  PAID: { label: "Payée", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  FAILED: { label: "Échouée", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  REFUNDED: { label: "Remboursée", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
}

const Loading = () => null;

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getInitials = (name: string | null) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const pendingCount = orders.filter((o) => o.status === "PENDING").length
  const processingCount = orders.filter((o) => o.status === "PROCESSING" || o.status === "CONFIRMED").length
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6 pt-12 lg:pt-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Commandes</h1>
          <p className="text-slate-400">Gérez et suivez les commandes de vos clients</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  <p className="text-xs text-slate-500">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{processingCount}</p>
                  <p className="text-xs text-slate-500">En préparation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{shippedCount}</p>
                  <p className="text-xs text-slate-500">Expédiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{deliveredCount}</p>
                  <p className="text-xs text-slate-500">Livrées</p>
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
                  placeholder="Rechercher par numéro, client ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
                  <Filter className="h-4 w-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all" className="text-white focus:bg-slate-800">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING" className="text-white focus:bg-slate-800">En attente</SelectItem>
                  <SelectItem value="CONFIRMED" className="text-white focus:bg-slate-800">Confirmée</SelectItem>
                  <SelectItem value="PROCESSING" className="text-white focus:bg-slate-800">En préparation</SelectItem>
                  <SelectItem value="SHIPPED" className="text-white focus:bg-slate-800">Expédiée</SelectItem>
                  <SelectItem value="DELIVERED" className="text-white focus:bg-slate-800">Livrée</SelectItem>
                  <SelectItem value="CANCELLED" className="text-white focus:bg-slate-800">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Liste des commandes</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""} trouvée{filteredOrders.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Commande</TableHead>
                    <TableHead className="text-slate-400">Client</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Statut</TableHead>
                    <TableHead className="text-slate-400">Paiement</TableHead>
                    <TableHead className="text-slate-400">Total</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status].icon
                    return (
                      <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{order.orderNumber}</p>
                              <p className="text-xs text-slate-500">{order.items?.length || 0} article{(order.items?.length || 0) > 1 ? "s" : ""}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                                {getInitials(order.user?.name || null)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm text-white">{order.user?.name}</p>
                              <p className="text-xs text-slate-500">{order.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {format(order.createdAt, "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusConfig[order.status].className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={paymentStatusConfig[order.paymentStatus].className}>
                            {paymentStatusConfig[order.paymentStatus].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">{formatCurrency(order.total)}</TableCell>
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
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsDetailDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir les détails
                              </DropdownMenuItem>
                              {order.status === "PENDING" && (
                                <DropdownMenuItem className="text-white focus:bg-slate-800">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirmer
                                </DropdownMenuItem>
                              )}
                              {(order.status === "CONFIRMED" || order.status === "PROCESSING") && (
                                <DropdownMenuItem className="text-white focus:bg-slate-800">
                                  <Truck className="h-4 w-4 mr-2" />
                                  Marquer expédiée
                                </DropdownMenuItem>
                              )}
                              {order.status === "SHIPPED" && (
                                <DropdownMenuItem className="text-white focus:bg-slate-800">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marquer livrée
                                </DropdownMenuItem>
                              )}
                              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                <>
                                  <DropdownMenuSeparator className="bg-slate-800" />
                                  <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Annuler
                                  </DropdownMenuItem>
                                </>
                              )}
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

        {/* Order Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-amber-500" />
                {selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Détails de la commande
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Status & Date */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={statusConfig[selectedOrder.status].className}>
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                    <Badge variant="secondary" className={paymentStatusConfig[selectedOrder.paymentStatus].className}>
                      {paymentStatusConfig[selectedOrder.paymentStatus].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {format(selectedOrder.createdAt, "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Informations client</h4>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {getInitials(selectedOrder.user?.name || null)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{selectedOrder.user?.name}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400">Adresse de livraison</h4>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                      <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                      <p className="text-sm text-white">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Articles commandés</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{item.product?.name}</p>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(item.unitPrice)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-white">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Récapitulatif</h4>
                  <div className="p-4 rounded-lg bg-slate-800/30 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Sous-total</span>
                      <span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">TVA (20%)</span>
                      <span className="text-white">{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Livraison</span>
                      <span className="text-white">
                        {selectedOrder.shipping > 0 ? formatCurrency(selectedOrder.shipping) : "Gratuite"}
                      </span>
                    </div>
                    <Separator className="bg-slate-700" />
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Total</span>
                      <span className="text-amber-500 text-lg">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400">Notes</h4>
                    <p className="text-sm text-slate-300 p-3 rounded-lg bg-slate-800/30">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}
