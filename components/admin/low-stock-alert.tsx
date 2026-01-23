"use client"

import type { Product } from "@/lib/admin/types"
import { AlertTriangle, Package } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
          <Package className="h-6 w-6 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-white">Aucune alerte</p>
        <p className="text-xs text-slate-500 mt-1">Tous les produits sont bien approvisionnés</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const stockPercentage = (product.stock / product.minStock) * 100
        const isVeryLow = stockPercentage < 30

        return (
          <div
            key={product.id}
            className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isVeryLow ? "bg-red-500/10" : "bg-amber-500/10"
                }`}
              >
                <AlertTriangle className={`h-4 w-4 ${isVeryLow ? "text-red-400" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={stockPercentage}
                    className="h-1.5 flex-1 bg-slate-700"
                  />
                  <span className={`text-xs font-medium ${isVeryLow ? "text-red-400" : "text-amber-400"}`}>
                    {product.stock}/{product.minStock}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
