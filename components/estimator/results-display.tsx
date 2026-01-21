"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
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
  Printer
} from "lucide-react"
import { type EstimateResult, getProjectTypeLabel, getQualityLabel } from "@/lib/calculations"

export function ResultsDisplay() {
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareSuccess, setShareSuccess] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

  const handlePrint = () => {
    window.print()
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Calculator className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-xl border-2 border-border bg-card p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
            No Estimate Found
          </h2>
          <p className="mt-2 text-muted-foreground">
            We couldn&apos;t find your estimate. Please create a new one.
          </p>
          <Link href="/estimator" className="mt-6 inline-block">
            <Button className="bg-primary text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Create New Estimate
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
            Back to Estimator
          </Link>
          <h1 className="text-2xl font-bold text-secondary md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Your Material Estimate
          </h1>
          <p className="text-muted-foreground">
            Project ID: <span className="font-mono text-secondary">{result.projectId}</span>
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="border-2 border-secondary text-secondary bg-transparent">
            <Printer className="mr-2 h-4 w-4" />
            Print PDF
          </Button>
          <Button variant="outline" onClick={handleShare} className="border-2 border-secondary text-secondary bg-transparent">
            {shareSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
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
            Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-secondary-foreground/70">Project Type</p>
              <p className="font-semibold">{getProjectTypeLabel(result.projectDetails.projectType)}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">Dimensions</p>
              <p className="font-semibold">
                {result.projectDetails.length}m x {result.projectDetails.width}m x {result.projectDetails.height}m
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">Floor Area</p>
              <p className="font-semibold">
                {(result.projectDetails.length * result.projectDetails.width).toFixed(1)} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">Quality Level</p>
              <p className="font-semibold">{getQualityLabel(result.projectDetails.qualityLevel)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              ${result.subtotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Waste Buffer ({result.wasteBufferPercentage}%)
              <AlertTriangle className="h-3 w-3" />
            </p>
            <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              +${result.wasteBuffer.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-primary">Total Estimated Cost</p>
            <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              ${result.total.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
            Material List ({result.materials.length} items)
          </CardTitle>
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
                      <th className="pb-2 pr-4">Material</th>
                      <th className="pb-2 pr-4 text-right">Quantity</th>
                      <th className="pb-2 pr-4 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-secondary">
                          {item.name}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {item.quantity.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-medium text-secondary">
                          ${item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
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
            <p className="mb-1 font-semibold text-secondary">Important Note</p>
            <p>
              This estimate is based on standard construction formulas and average material prices. 
              Actual quantities and costs may vary based on local conditions, supplier pricing, 
              and specific project requirements. Always consult with a professional before purchasing materials.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center print:hidden">
        <Link href="/estimator">
          <Button variant="outline" className="w-full border-2 border-secondary text-secondary sm:w-auto bg-transparent">
            <Calculator className="mr-2 h-4 w-4" />
            New Estimate
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="w-full bg-primary text-primary-foreground sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Save to Dashboard
          </Button>
        </Link>
      </div>

      {/* Print timestamp */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Generated on {result.generatedAt.toLocaleDateString()} at {result.generatedAt.toLocaleTimeString()} | BuildCalc Pro
      </p>
    </div>
  )
}
