"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Extended revenue data with more details
const detailedRevenueData = [
  { month: "Août", revenue: 98500, orders: 145, customers: 89, avgOrder: 679 },
  { month: "Sept", revenue: 112300, orders: 168, customers: 102, avgOrder: 668 },
  { month: "Oct", revenue: 125800, orders: 192, customers: 118, avgOrder: 655 },
  { month: "Nov", revenue: 138200, orders: 215, customers: 134, avgOrder: 643 },
  { month: "Déc", revenue: 145600, orders: 232, customers: 152, avgOrder: 628 },
  { month: "Jan", revenue: 156420, orders: 248, customers: 168, avgOrder: 631 },
]

// Category sales data
const categorySalesData = [
  { name: "Ciment", value: 45, color: "#f59e0b" },
  { name: "Acier", value: 25, color: "#3b82f6" },
  { name: "Bois", value: 12, color: "#10b981" },
  { name: "Plomberie", value: 8, color: "#8b5cf6" },
  { name: "Electricité", value: 6, color: "#ef4444" },
  { name: "Outils", value: 4, color: "#06b6d4" },
]

// Order status distribution
const orderStatusData = [
  { name: "Livrées", value: 65, color: "#10b981" },
  { name: "Expédiées", value: 15, color: "#06b6d4" },
  { name: "En préparation", value: 12, color: "#8b5cf6" },
  { name: "En attente", value: 5, color: "#f59e0b" },
  { name: "Annulées", value: 3, color: "#ef4444" },
]

// Daily sales for current week
const dailySalesData = [
  { day: "Lun", sales: 12500, orders: 18 },
  { day: "Mar", sales: 18200, orders: 24 },
  { day: "Mer", sales: 15800, orders: 21 },
  { day: "Jeu", sales: 22400, orders: 32 },
  { day: "Ven", sales: 28600, orders: 38 },
  { day: "Sam", sales: 35200, orders: 45 },
  { day: "Dim", sales: 8900, orders: 12 },
]

// KPIs
const kpis = [
  {
    title: "Chiffre d'affaires",
    value: formatCurrency(156420),
    change: 12.5,
    changeLabel: "vs mois dernier",
    icon: DollarSign,
    color: "amber",
  },
  {
    title: "Commandes",
    value: "248",
    change: 8.2,
    changeLabel: "vs mois dernier",
    icon: ShoppingCart,
    color: "blue",
  },
  {
    title: "Panier moyen",
    value: formatCurrency(631),
    change: -2.1,
    changeLabel: "vs mois dernier",
    icon: Package,
    color: "emerald",
  },
  {
    title: "Nouveaux clients",
    value: "42",
    change: 15.3,
    changeLabel: "vs mois dernier",
    icon: Users,
    color: "purple",
  },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("6months")
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!dashboardData) return null

  const kpis = [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(dashboardData.stats.totalRevenue),
      change: dashboardData.stats.revenueChange,
      changeLabel: "vs mois dernier",
      icon: DollarSign,
      color: "amber",
    },
    {
      title: "Commandes",
      value: dashboardData.stats.totalOrders.toString(),
      change: dashboardData.stats.ordersChange,
      changeLabel: "vs mois dernier",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      title: "Produits",
      value: dashboardData.stats.totalProducts.toString(),
      change: 0,
      changeLabel: `${dashboardData.stats.lowStockProducts} stock faible`,
      icon: Package,
      color: "emerald",
    },
    {
      title: "Clients",
      value: dashboardData.stats.totalUsers.toString(),
      change: dashboardData.stats.usersChange,
      changeLabel: "vs mois dernier",
      icon: Users,
      color: "purple",
    },
  ]

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-slate-300">
              {entry.name}: {entry.name.includes("revenue") || entry.name.includes("sales") 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytiques</h1>
          <p className="text-slate-400">Analysez les performances de votre activité</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
              <Calendar className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="7days" className="text-white focus:bg-slate-800">7 derniers jours</SelectItem>
              <SelectItem value="30days" className="text-white focus:bg-slate-800">30 derniers jours</SelectItem>
              <SelectItem value="6months" className="text-white focus:bg-slate-800">6 derniers mois</SelectItem>
              <SelectItem value="1year" className="text-white focus:bg-slate-800">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <p className="text-sm text-slate-400 truncate">{kpi.title}</p>
                  <p className="text-2xl font-bold text-white truncate">{kpi.value}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {kpi.change >= 0 ? (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs shrink-0">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        +{kpi.change}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs shrink-0">
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        {kpi.change}%
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500 truncate">{kpi.changeLabel}</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-${kpi.color}-500/10`}>
                  <kpi.icon className={`h-6 w-6 text-${kpi.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
            <BarChart3 className="h-4 w-4 mr-2" />
            Revenus
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
            <Activity className="h-4 w-4 mr-2" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
            <PieChart className="h-4 w-4 mr-2" />
            Catégories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Revenue Area Chart */}
            <Card className="lg:col-span-5 bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white truncate">Évolution du chiffre d'affaires</CardTitle>
                <CardDescription className="text-slate-400 truncate">
                  Revenus et commandes sur 6 mois
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-[300px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} width={35} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenus (MAD)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales Bar Chart */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white truncate text-base">Ventes hebdo</CardTitle>
                <CardDescription className="text-slate-400 truncate text-xs">Cette semaine</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-[300px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySalesData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} width={28} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sales" name="Ventes (MAD)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Orders Line Chart */}
            <Card className="lg:col-span-5 bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white truncate">Évolution des commandes</CardTitle>
                <CardDescription className="text-slate-400 truncate">
                  Commandes et nouveaux clients
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-[300px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="Commandes"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        name="Clients"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Pie Chart */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white truncate">Statut des commandes</CardTitle>
                <CardDescription className="text-slate-400 truncate">Répartition actuelle</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {orderStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 truncate text-xs">{item.name}</span>
                      </div>
                      <span className="text-white font-medium text-xs shrink-0 ml-2">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Category Sales Bar Chart */}
            <Card className="lg:col-span-4 bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white truncate">Ventes par catégorie</CardTitle>
                <CardDescription className="text-slate-400 truncate">
                  Répartition par catégorie de produits
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-[300px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorySalesData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={65} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="value" name="Part des ventes" radius={[0, 4, 4, 0]}>
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card className="lg:col-span-3 bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white truncate">Distribution des catégories</CardTitle>
                <CardDescription className="text-slate-400 truncate">Visualisation en camembert</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={categorySalesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                      >
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categorySalesData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm min-w-0">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Products Table */}
      <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-white truncate">Produits les plus performants</CardTitle>
              <CardDescription className="text-slate-400 truncate">
                Classement par chiffre d'affaires généré
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">
              Top 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="space-y-4">
            {dashboardData.topProducts.map((product: any, index: number) => {
              const maxRevenue = Math.max(...dashboardData.topProducts.map((p: any) => p.revenue))
              const percentage = (product.revenue / maxRevenue) * 100

              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-amber-500 shrink-0">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{product.name}</p>
                        <p className="text-sm text-slate-500 truncate">{product.sales} unités vendues</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-white">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-slate-500">{percentage.toFixed(1)}% du top</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
