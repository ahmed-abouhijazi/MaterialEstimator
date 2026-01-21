"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Info } from "lucide-react"
import { getAllBrandsForMaterial } from "@/lib/material-brands"
import { formatCurrency } from "@/lib/currency"
import { useLocale } from "@/lib/locale-context"
import type { MaterialItem } from "@/lib/calculations"

interface MaterialRowProps {
  material: MaterialItem
  location: string
  onBrandChange: (materialIndex: number, newBrand: string, newMultiplier: number) => void
  materialIndex: number
}

export function MaterialRow({ material, location, onBrandChange, materialIndex }: MaterialRowProps) {
  const [availableBrands, setAvailableBrands] = useState<any[]>([])
  const [selectedBrand, setSelectedBrand] = useState(material.recommendedBrand || material.selectedBrand || 'standard')
  const [showBrands, setShowBrands] = useState(false)
  const { currency } = useLocale()

  useEffect(() => {
    // Fetch available brands for this material
    const brands = getAllBrandsForMaterial(material.name, location)
    setAvailableBrands(brands)
  }, [material.name, location])

  const handleBrandChange = (brandName: string) => {
    setSelectedBrand(brandName)
    
    if (brandName === 'standard') {
      onBrandChange(materialIndex, '', 1.0)
    } else {
      const brand = availableBrands.find(b => b.name === brandName)
      if (brand) {
        onBrandChange(materialIndex, brandName, brand.priceMultiplier)
      }
    }
  }

  const currentBrandInfo = availableBrands.find(b => b.name === selectedBrand)

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/30">
      <td className="py-3 pr-4">
        <div>
          <p className="font-medium text-secondary">{material.name}</p>
          {material.recommendedBrand && (
            <div className="mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">Recommended: {material.recommendedBrand}</span>
            </div>
          )}
          {availableBrands.length > 0 && !showBrands && (
            <button
              onClick={() => setShowBrands(true)}
              className="mt-1 text-xs text-blue-600 hover:underline"
            >
              View brand options ({availableBrands.length})
            </button>
          )}
          {showBrands && availableBrands.length > 0 && (
            <div className="mt-2 space-y-2">
              <Select value={selectedBrand} onValueChange={handleBrandChange}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Base Price)</SelectItem>
                  {availableBrands.map((brand) => (
                    <SelectItem key={brand.name} value={brand.name}>
                      <div className="flex items-center gap-2">
                        <span>{brand.name}</span>
                        <Badge variant={brand.quality === 'premium' ? 'default' : 'secondary'} className="text-xs">
                          {brand.quality}
                        </Badge>
                        <span className="text-muted-foreground">
                          {brand.priceMultiplier > 1 ? `+${((brand.priceMultiplier - 1) * 100).toFixed(0)}%` : 
                           brand.priceMultiplier < 1 ? `-${((1 - brand.priceMultiplier) * 100).toFixed(0)}%` : 
                           'base'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentBrandInfo && (
                <div className="flex items-start gap-1 rounded bg-blue-50 p-2 text-xs text-blue-900">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  <div>
                    <p className="font-medium">{currentBrandInfo.description}</p>
                    <p className="mt-0.5 text-blue-700">
                      Availability: {currentBrandInfo.availability}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowBrands(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Hide brands
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="py-3 pr-4 text-right">
        {material.quantity.toLocaleString()} {material.unit}
      </td>
      <td className="py-3 pr-4 text-right text-muted-foreground">
        {formatCurrency(material.unitPrice, currency)}
      </td>
      <td className="py-3 text-right font-medium text-secondary">
        {formatCurrency(material.totalPrice, currency)}
      </td>
    </tr>
  )
}
