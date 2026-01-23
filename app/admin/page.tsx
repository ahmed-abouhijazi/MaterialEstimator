"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react"
import { dashboardStats, revenueData, topProducts, orders, products } from "@/lib/admin/mock-data"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import { LowStockAlert } from "@/components/admin/low-stock-alert"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const stats = [
  {
    title: "Chiffre d'affaires",
    value: formatCurrency(dashboardStats.totalRevenue),
    change: dashboardStats.revenueChange,
    icon: DollarSign,
    description: "vs mois dernier",
  },
  {
    title: "Commandes",
    value: dashboardStats.totalOrders.toString(),
    change: dashboardStats.ordersChange,
    icon: ShoppingCart,
    description: "vs mois dernier",
  },
  {
    title: "Produits",
    value: dashboardStats.totalProducts.toString(),
    change: null,
    icon: Package,
    description: `${dashboardStats.lowStockProducts} en stock faible`,
    alert: dashboardStats.lowStockProducts > 0,
  },
  {
    title: "Clients",
    value: dashboardStats.totalUsers.toString(),
    change: dashboardStats.usersChange,
    icon: Users,
    description: "vs mois dernier",
  },
]

export default function AdminDashboardPage() {
  const recentOrders = orders.slice(0, 5)
  const lowStockProducts = products.filter((p) => p.stock < p.minStock)

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Tableau de bord</h1>
        <p className="text-slate-400">Vue d'ensemble de votre activité commerciale</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/80 transition-colors overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-slate-400 truncate">{stat.title}</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <stat.icon className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white truncate">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {stat.change !== null && (
                  <Badge
                    variant="secondary"
                    className={`shrink-0 ${
                      stat.change >= 0
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change}%
                  </Badge>
                )}
                {stat.alert && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Alerte
                  </Badge>
                )}
                <span className="text-xs text-slate-500 truncate">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 bg-slate-900/50 border-slate-800 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white truncate">Évolution des ventes</CardTitle>
                <CardDescription className="text-slate-400 truncate">Chiffre d'affaires des 6 derniers mois</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3 bg-slate-900/50 border-slate-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white truncate">Produits les plus vendus</CardTitle>
            <CardDescription className="text-slate-400 truncate">Top 5 par chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-amber-500 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 truncate">{product.sales} ventes</p>
                  </div>
                  <div className="text-sm font-medium text-emerald-400 shrink-0">{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4 bg-slate-900/50 border-slate-800 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white truncate">Commandes récentes</CardTitle>
                <CardDescription className="text-slate-400 truncate">Les 5 dernières commandes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-3 bg-slate-900/50 border-slate-800 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white truncate">Alertes de stock</CardTitle>
                <CardDescription className="text-slate-400 truncate">Produits en stock faible</CardDescription>
              </div>
              {lowStockProducts.length > 0 && (
                <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 shrink-0">
                  {lowStockProducts.length} alerte{lowStockProducts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <LowStockAlert products={lowStockProducts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
