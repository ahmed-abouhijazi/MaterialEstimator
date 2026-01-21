"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, ArrowRight, AlertCircle } from "lucide-react"
import { calculateMaterials, type ProjectInput, type ProjectType, type QualityLevel, type EstimateResult } from "@/lib/calculations"

const projectTypes: { value: ProjectType; label: string; description: string }[] = [
  { value: "house", label: "Full House", description: "Complete residential construction" },
  { value: "room", label: "Single Room", description: "Adding a new room" },
  { value: "wall", label: "Wall", description: "Wall construction or fence" },
  { value: "roof", label: "Roof/Roofing", description: "New roof or re-roofing" },
  { value: "extension", label: "Extension", description: "Home extension project" },
  { value: "foundation", label: "Foundation", description: "Foundation/slab work" },
  { value: "renovation", label: "Renovation", description: "Interior renovation" },
]

const qualityLevels: { value: QualityLevel; label: string; description: string }[] = [
  { value: "basic", label: "Basic", description: "Economy materials, functional" },
  { value: "standard", label: "Standard", description: "Recommended for most projects" },
  { value: "premium", label: "Premium", description: "High-end materials" },
]

const locations = [
  "United States - Northeast",
  "United States - Southeast",
  "United States - Midwest",
  "United States - Southwest",
  "United States - West Coast",
  "Canada",
  "United Kingdom",
  "Australia",
  "Other",
]

export function EstimatorForm() {
  const router = useRouter()
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<Partial<ProjectInput>>({
    projectType: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
    location: "",
    qualityLevel: "standard",
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type"
    }
    if (!formData.length || formData.length <= 0) {
      newErrors.length = "Length must be greater than 0"
    }
    if (!formData.width || formData.width <= 0) {
      newErrors.width = "Width must be greater than 0"
    }
    if (!formData.height || formData.height <= 0) {
      newErrors.height = "Height must be greater than 0"
    }
    if (!formData.location) {
      newErrors.location = "Please select a location"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsCalculating(true)

    try {
      // Call API endpoint for calculation with AI-powered pricing
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Estimation failed')
      }

      const result: EstimateResult = await response.json()
      
      // Store result in sessionStorage for the results page
      sessionStorage.setItem("lastEstimate", JSON.stringify(result))
      
      // Navigate to results page
      router.push(`/estimator/results?id=${result.projectId}`)
    } catch (error) {
      console.error("Calculation error:", error)
      // Fallback to client-side calculation if API fails
      try {
        const result: EstimateResult = calculateMaterials(formData as ProjectInput)
        sessionStorage.setItem("lastEstimate", JSON.stringify(result))
        router.push(`/estimator/results?id=${result.projectId}`)
      } catch (fallbackError) {
        setErrors({ submit: "An error occurred. Please try again." })
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const updateField = <K extends keyof ProjectInput>(
    field: K,
    value: ProjectInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Project Type */}
        <Card className="border-2 border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              Step 1: Project Type
            </CardTitle>
            <CardDescription>What kind of construction project is this?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projectTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("projectType", type.value)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    formData.projectType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                    {type.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
            {errors.projectType && (
              <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.projectType}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card className="border-2 border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              Step 2: Dimensions
            </CardTitle>
            <CardDescription>Enter the measurements in meters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 12"
                  value={formData.length || ""}
                  onChange={(e) => updateField("length", parseFloat(e.target.value) || 0)}
                  className={`border-2 ${errors.length ? "border-destructive" : "border-input"}`}
                />
                {errors.length && (
                  <p className="text-sm text-destructive">{errors.length}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 10"
                  value={formData.width || ""}
                  onChange={(e) => updateField("width", parseFloat(e.target.value) || 0)}
                  className={`border-2 ${errors.width ? "border-destructive" : "border-input"}`}
                />
                {errors.width && (
                  <p className="text-sm text-destructive">{errors.width}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (m)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 3"
                  value={formData.height || ""}
                  onChange={(e) => updateField("height", parseFloat(e.target.value) || 0)}
                  className={`border-2 ${errors.height ? "border-destructive" : "border-input"}`}
                />
                {errors.height && (
                  <p className="text-sm text-destructive">{errors.height}</p>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Total floor area: <span className="font-medium text-secondary">{((formData.length || 0) * (formData.width || 0)).toFixed(1)} m²</span>
            </p>
          </CardContent>
        </Card>

        {/* Location & Quality */}
        <Card className="border-2 border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
              Step 3: Location & Quality
            </CardTitle>
            <CardDescription>Help us provide accurate local pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => updateField("location", value)}
                >
                  <SelectTrigger className={`border-2 ${errors.location ? "border-destructive" : "border-input"}`}>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Quality Level</Label>
                <div className="flex gap-2">
                  {qualityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateField("qualityLevel", level.value)}
                      className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                        formData.qualityLevel === level.value
                          ? "border-primary bg-primary/5 font-medium"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        {errors.submit && (
          <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center text-destructive">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isCalculating}
            className="h-14 px-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isCalculating ? (
              <>
                <Calculator className="mr-2 h-5 w-5 animate-pulse" />
                Calculating...
              </>
            ) : (
              <>
                Calculate Materials
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
