"use client"

import type { Order } from "@/lib/admin/types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface RecentOrdersTableProps {
  orders: Order[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const statusConfig = {
  PENDING: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  CONFIRMED: { label: "Confirmée", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  PROCESSING: { label: "En cours", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  SHIPPED: { label: "Expédiée", className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  DELIVERED: { label: "Livrée", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Annulée", className: "bg-red-500/10 text-red-400 border-red-500/20" },
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
              {getInitials(order.user?.name || null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">{order.orderNumber}</p>
              <Badge variant="secondary" className={statusConfig[order.status].className}>
                {statusConfig[order.status].label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {order.user?.name} • {formatDistanceToNow(order.createdAt, { addSuffix: true, locale: fr })}
            </p>
          </div>
          <div className="text-sm font-medium text-white">{formatCurrency(order.total)}</div>
        </div>
      ))}
    </div>
  )
}
