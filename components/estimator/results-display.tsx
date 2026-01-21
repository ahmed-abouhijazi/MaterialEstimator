"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Download, 
  Share2, 
  ArrowLeft, 
  Calculator, 
  AlertTriangle,
  FileText,
  CheckCircle,
  Printer,
  Sparkles,
  Save
} from "lucide-react"
import { type EstimateResult, type MaterialItem, getProjectTypeLabel, getQualityLabel } from "@/lib/calculations"
import { MaterialRow } from "./material-row"
import { getCurrencyForLocation, formatCurrency } from "@/lib/currency"
import { useLocale } from "@/lib/locale-context"

export function ResultsDisplay() {
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [accessStatus, setAccessStatus] = useState<any>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const router = useRouter()
  const { t, currency } = useLocale()

  // Material name translation helper
  const translateMaterial = (name: string) => {
    const key = `estimator.results.materialNames.${name}`
    const translated = t(key)
    return translated === key ? name : translated
  }

  useEffect(() => {
    // Check access first
    checkAccess()
    
    // Load result from sessionStorage
    const stored = sessionStorage.getItem("lastEstimate")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date string back to Date object
        parsed.generatedAt = new Date(parsed.generatedAt)
        setResult(parsed)
      } catch (e) {
        console.error("Failed to parse estimate:", e)
      }
    }
    setLoading(false)
  }, [])

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/check-access')
      const data = await response.json()
      setAccessStatus(data)
    } catch (error) {
      console.error('Error checking access:', error)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleBrandChange = (materialIndex: number, newBrand: string, newMultiplier: number) => {
    if (!result) return

    const updatedMaterials = [...result.materials]
    const material = updatedMaterials[materialIndex]
    
    // Calculate new price based on brand multiplier
    const basePrice = material.unitPrice / (material.brandMultiplier || 1.0)
    const newUnitPrice = basePrice * newMultiplier
    const newTotalPrice = newUnitPrice * material.quantity

    updatedMaterials[materialIndex] = {
      ...material,
      selectedBrand: newBrand,
      brandMultiplier: newMultiplier,
      unitPrice: Math.round(newUnitPrice * 100) / 100,
      totalPrice: Math.round(newTotalPrice * 100) / 100
    }

    // Recalculate totals
    const subtotal = updatedMaterials.reduce((sum, item) => sum + item.totalPrice, 0)
    const wasteBuffer = subtotal * (result.wasteBufferPercentage / 100)
    const total = subtotal + wasteBuffer

    const updatedResult = {
      ...result,
      materials: updatedMaterials,
      subtotal: Math.round(subtotal * 100) / 100,
      wasteBuffer: Math.round(wasteBuffer * 100) / 100,
      total: Math.round(total * 100) / 100
    }

    setResult(updatedResult)
    sessionStorage.setItem("lastEstimate", JSON.stringify(updatedResult))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSave = async () => {
    if (!result) return

    if (!session) {
      // Redirect to login if not authenticated
      router.push('/login?callbackUrl=/estimator/results')
      return
    }

    setSaving(true)
    try {
      const currency = getCurrencyForLocation(result.projectDetails.location)
      
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: `${getProjectTypeLabel(result.projectDetails.projectType)} - ${result.projectDetails.location}`,
          location: result.projectDetails.location,
          currency,
          materials: result.materials,
          pricing: {
            totalCost: result.total,
            materialCost: result.subtotal,
            laborCost: 0, // Add labor calculation if available
            equipmentCost: 0, // Add equipment calculation if available
            contingency: result.wasteBuffer
          }
        })
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving estimate:', error)
      alert('Failed to save estimate. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    if (!result) return

    const shareText = `BuildCalc Pro Estimate #${result.projectId}
    
Project: ${getProjectTypeLabel(result.projectDetails.projectType)}
Dimensions: ${result.projectDetails.length}m x ${result.projectDetails.width}m x ${result.projectDetails.height}m
Quality: ${getQualityLabel(result.projectDetails.qualityLevel)}

Total Estimated Cost: $${result.total.toLocaleString()}
(includes ${result.wasteBufferPercentage}% waste buffer)

Materials: ${result.materials.length} items

Get your own estimate at: buildcalc.pro`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `BuildCalc Estimate #${result.projectId}`,
          text: shareText,
        })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch {
        // User cancelled or error
        await copyToClipboard(shareText)
      }
    } else {
      await copyToClipboard(shareText)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement("textarea")
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  // Group materials by category
  const groupedMaterials = result?.materials.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof result.materials>)

  if (loading || checkingAccess) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Calculator className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    )
  }

  // Check if access is denied
  if (accessStatus && !accessStatus.canView) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="py-12">
            <AlertTriangle className="mx-auto h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('estimator.results.subscriptionRequired')} 🚀</h2>
            <p className="text-muted-foreground mb-6">
              {accessStatus.message || t('estimator.results.subscriptionMessage')}
            </p>
            <div className="flex gap-4 justify-center">
              {!session ? (
                <>
                  <Link href="/signup">
                    <Button className="bg-primary text-primary-foreground">
                      {t('estimator.results.signUpForTrial')}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline">
                      {t('estimator.results.logIn')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/pricing">
                    <Button className="bg-primary text-primary-foreground">
                      {t('estimator.results.viewPricingPlans')}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">
                      {t('estimator.results.goToDashboard')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-xl border-2 border-border bg-card p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
            {t('estimator.results.noEstimateFound')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('estimator.results.noEstimateText')}
          </p>
          <Link href="/estimator" className="mt-6 inline-block">
            <Button className="bg-primary text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('estimator.results.createNewEstimate')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl" ref={printRef}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/estimator" className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-secondary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t('estimator.results.backToEstimator')}
          </Link>
          <h1 className="text-2xl font-bold text-secondary md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            {t('estimator.results.yourEstimate')}
          </h1>
          <p className="text-muted-foreground">
            {t('estimator.results.projectId')}: <span className="font-mono text-secondary">{result.projectId}</span>
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button 
            onClick={handleSave}
            disabled={saving || saveSuccess}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('estimator.results.saved')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {saving ? t('estimator.results.saving') : (session ? t('estimator.results.save') : t('estimator.results.signInToSave'))}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handlePrint} className="border-2 border-secondary text-secondary bg-transparent">
            <Printer className="mr-2 h-4 w-4" />
            {t('estimator.results.printPDF')}
          </Button>
          <Button variant="outline" onClick={handleShare} className="border-2 border-secondary text-secondary bg-transparent">
            {shareSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                {t('estimator.results.copied')}
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                {t('estimator.results.share')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Project Summary */}
      <Card className="mb-6 border-2 border-secondary bg-secondary text-secondary-foreground">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <FileText className="h-5 w-5 text-primary" />
            {t('estimator.results.projectSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-secondary-foreground/70">{t('estimator.results.projectType')}</p>
              <p className="font-semibold">{getProjectTypeLabel(result.projectDetails.projectType)}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">{t('estimator.results.dimensions')}</p>
              <p className="font-semibold">
                {result.projectDetails.length}m x {result.projectDetails.width}m x {result.projectDetails.height}m
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">{t('estimator.area')}</p>
              <p className="font-semibold">
                {(result.projectDetails.length * result.projectDetails.width).toFixed(1)} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">{t('estimator.results.quality')}</p>
              <p className="font-semibold">{getQualityLabel(result.projectDetails.qualityLevel)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('estimator.results.subtotal')}</p>
            <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(result.subtotal, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              {t('estimator.results.wasteBuffer')} ({result.wasteBufferPercentage}%)
              <AlertTriangle className="h-3 w-3" />
            </p>
            <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              +{formatCurrency(result.wasteBuffer, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-primary">{t('estimator.results.totalEstimatedCost')}</p>
            <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(result.total, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              {t('estimator.results.materialList')} ({result.materials.length} {t('estimator.results.items')})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t('estimator.results.clickForBrands')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {groupedMaterials && Object.entries(groupedMaterials).map(([category, materials]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="mb-3 border-b-2 border-border pb-2 font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                {category}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-2 pr-4">{t('estimator.results.material')}</th>
                      <th className="pb-2 pr-4 text-right">{t('estimator.results.quantity')}</th>
                      <th className="pb-2 pr-4 text-right">{t('estimator.results.unitPrice')}</th>
                      <th className="pb-2 text-right">{t('estimator.results.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((item, idx) => {
                      const globalIndex = result.materials.indexOf(item)
                      return (
                        <MaterialRow
                          key={idx}
                          material={item}
                          location={result.projectDetails.location}
                          onBrandChange={handleBrandChange}
                          materialIndex={globalIndex}
                          translateMaterial={translateMaterial}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-6 rounded-lg border-2 border-border bg-muted p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-1 font-semibold text-secondary">{t('estimator.results.disclaimer')}</p>
            <p>
              {t('estimator.results.disclaimerText')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center print:hidden">
        <Link href="/estimator">
          <Button variant="outline" className="w-full border-2 border-secondary text-secondary sm:w-auto bg-transparent">
            <Calculator className="mr-2 h-4 w-4" />
            {t('estimator.results.newEstimate')}
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="w-full bg-primary text-primary-foreground sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t('estimator.results.save')}
          </Button>
        </Link>
      </div>

      {/* Print timestamp */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t('estimator.results.generatedOn')} {result.generatedAt.toLocaleDateString()} {t('estimator.results.at')} {result.generatedAt.toLocaleTimeString()} | BuildCalc Pro
      </p>
    </div>
  )
}
