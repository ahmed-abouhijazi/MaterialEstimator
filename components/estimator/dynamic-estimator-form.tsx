"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calculator, ArrowRight, ArrowLeft, Home, Plus, Layers, Hammer, Building, Mountain, Wrench, Loader2, CheckCircle2 } from "lucide-react"
import { calculateMaterials, type ProjectInput, type ProjectType, type QualityLevel, type EstimateResult } from "@/lib/calculations"

type SmartQuestion = {
  step: 1 | 2 | 3
  key: keyof ProjectInput
  title: string
  description: string
  type: "number" | "select" | "boolean"
  min?: number
  max?: number
  stepValue?: number
  options?: { value: string; label: string }[]
  showWhen?: (form: Partial<ProjectInput>) => boolean
}

const locations = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "France",
  "Morocco",
  "Other",
]

export function DynamicEstimatorForm() {
  const router = useRouter()
  const { t } = useLocale()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Partial<ProjectInput>>({
    estimationMode: "advanced",
    qualityLevel: "standard",
    layoutIntent: "balanced",
    hasBalcony: true,
    hasElectricity: true,
    hasPlumbing: true,
    hasFinishing: true,
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const projectTypes: { value: ProjectType; label: string; description: string; icon: any }[] = [
    { value: "house", label: t("estimator.projectTypes.house"), description: t("estimator.projectTypes.houseDesc"), icon: Home },
    { value: "extension", label: t("estimator.projectTypes.extension"), description: t("estimator.projectTypes.extensionDesc"), icon: Plus },
    { value: "room", label: t("estimator.projectTypes.room"), description: t("estimator.projectTypes.roomDesc"), icon: Layers },
    { value: "wall", label: t("estimator.projectTypes.wall"), description: t("estimator.projectTypes.wallDesc"), icon: Hammer },
    { value: "roof", label: t("estimator.projectTypes.roof"), description: t("estimator.projectTypes.roofDesc"), icon: Building },
    { value: "foundation", label: t("estimator.projectTypes.foundation"), description: t("estimator.projectTypes.foundationDesc"), icon: Mountain },
    { value: "renovation", label: t("estimator.projectTypes.renovation"), description: t("estimator.projectTypes.renovationDesc"), icon: Wrench },
  ]

  const qualityLevels: { value: QualityLevel; label: string; description: string }[] = [
    { value: "basic", label: t("estimator.qualityLevels.basic"), description: t("estimator.qualityLevels.basicDesc") },
    { value: "standard", label: t("estimator.qualityLevels.standard"), description: t("estimator.qualityLevels.standardDesc") },
    { value: "premium", label: t("estimator.qualityLevels.premium"), description: t("estimator.qualityLevels.premiumDesc") },
  ]

  const updateField = <K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[field]
        return nextErrors
      })
    }
  }

  useEffect(() => {
    if (!formData.projectType) return

    const defaultsByType: Partial<ProjectInput> =
      formData.projectType === 'house'
        ? { numberOfRooms: formData.numberOfRooms || 5, numberOfBathrooms: formData.numberOfBathrooms || 2, numberOfFloors: formData.numberOfFloors || 2 }
        : formData.projectType === 'extension'
          ? { numberOfRooms: formData.numberOfRooms || 2, numberOfBathrooms: formData.numberOfBathrooms || 1, numberOfFloors: formData.numberOfFloors || 1 }
          : formData.projectType === 'room'
            ? { numberOfRooms: 1, numberOfBathrooms: formData.roomType === 'bathroom' ? 1 : formData.numberOfBathrooms || 1, numberOfFloors: 1 }
            : formData.projectType === 'renovation'
              ? { numberOfFloors: formData.numberOfFloors || 1, numberOfRooms: formData.numberOfRooms || 3, numberOfBathrooms: formData.numberOfBathrooms || 1 }
              : { numberOfFloors: formData.numberOfFloors || 1 }

    setFormData((prev) => ({ ...defaultsByType, ...prev }))
  }, [formData.projectType, formData.roomType])

  const handleSelectAnswer = (question: SmartQuestion, value: string) => {
    updateField(question.key, value as never)
    // Step 1 = project type: auto-advance immediately on selection
    if (currentStep === 1 && question.key === 'projectType') {
      setTimeout(() => {
        if (validateStep(1)) {
          setCurrentStep(2)
        }
      }, 150)
    }
  }

  const getStepLabel = (step: number) => {
    if (step === 1) {
      return formData.projectType
        ? projectTypes.find((pt) => pt.value === formData.projectType)?.label || "Project"
        : "Project Type"
    }
    if (step === 2) return "Dimensions"
    return "Quality & Location"
  }

  const smartQuestions = useMemo(() => {
    const questions: SmartQuestion[] = [
      // â”€â”€ STEP 1: Project Type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
        step: 1,
        key: "projectType",
        title: "What are you building?",
        description: "Choose your project type. The 2D floor plan and material formulas will adapt instantly.",
        type: "select",
        options: projectTypes.map((pt) => ({ value: pt.value, label: pt.label })),
      },

      // â”€â”€ STEP 2: Dimensions & Space â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
        step: 2,
        key: "length",
        title: "Total length (m)",
        description: "Main span of the building along the longest axis.",
        type: "number", min: 2, max: 80, stepValue: 0.1,
      },
      {
        step: 2,
        key: "width",
        title: "Total width (m)",
        description: "Depth of the building perpendicular to the length.",
        type: "number", min: 2, max: 80, stepValue: 0.1,
      },
      {
        step: 2,
        key: "height",
        title: "Floor-to-ceiling height (m)",
        description: "Wall height per floor â€” affects structure, paint area, and service runs.",
        type: "number", min: 2, max: 8, stepValue: 0.1,
      },
      {
        step: 2,
        key: "numberOfFloors",
        title: "Number of floors",
        description: "Each extra floor multiplies structure, circulation, and services.",
        type: "number", min: 1, max: 5, stepValue: 1,
        showWhen: (form) => ["house", "extension", "renovation", "wall"].includes(form.projectType || "house"),
      },
      {
        step: 2,
        key: "numberOfRooms",
        title: "Number of rooms",
        description: "Drives partitioning, openings, and space distribution on the floor plan.",
        type: "number", min: 1, max: 20, stepValue: 1,
        showWhen: (form) => ["house", "extension"].includes(form.projectType || "house"),
      },
      {
        step: 2,
        key: "numberOfBathrooms",
        title: "Number of bathrooms",
        description: "Bathrooms strongly affect plumbing, fixtures, and wet-zone finishes.",
        type: "number", min: 1, max: 12, stepValue: 1,
        showWhen: (form) => ["house", "extension", "room", "renovation"].includes(form.projectType || "house"),
      },
      {
        step: 2,
        key: "roomType",
        title: "What kind of room?",
        description: "Room function shapes the floor plan and finish assumptions.",
        type: "select",
        options: [
          { value: "bedroom",     label: "Bedroom" },
          { value: "living_room", label: "Living Room" },
          { value: "kitchen",     label: "Kitchen" },
          { value: "bathroom",    label: "Bathroom" },
        ],
        showWhen: (form) => form.projectType === "room",
      },
      {
        step: 2,
        key: "layoutIntent",
        title: "Layout style",
        description: "Open = fewer partitions. Zoned = clearly separated rooms.",
        type: "select",
        options: [
          { value: "open",     label: "Open Concept" },
          { value: "balanced", label: "Balanced" },
          { value: "zoned",    label: "Clearly Zoned" },
        ],
        showWhen: (form) => ["house", "extension", "renovation", "room"].includes(form.projectType || "house"),
      },
      {
        step: 2,
        key: "hasBalcony",
        title: "Include balcony / patio?",
        description: "Adds an outdoor terrace on the main facade.",
        type: "boolean",
        showWhen: (form) => ["house", "extension", "renovation"].includes(form.projectType || "house"),
      },
      {
        step: 2,
        key: "wallType",
        title: "Wall system",
        description: "Structural wall material affects quantities, cost, and plan detailing.",
        type: "select",
        options: [
          { value: "concrete_blocks", label: "Concrete Blocks" },
          { value: "bricks",          label: "Bricks" },
          { value: "wood_frame",      label: "Wood Frame" },
          { value: "stone",           label: "Stone" },
        ],
        showWhen: (form) => ["house", "extension", "wall"].includes(form.projectType || "house"),
      },
      {
        step: 2,
        key: "roofType",
        title: "Roof type",
        description: "Roof geometry changes area, framing, and material quantities.",
        type: "select",
        options: [
          { value: "flat",    label: "Flat" },
          { value: "pitched", label: "Pitched" },
          { value: "mansard", label: "Mansard" },
        ],
        showWhen: (form) => ["house", "extension", "roof"].includes(form.projectType || "house"),
      },

      // â”€â”€ STEP 3: Quality & Services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
        step: 3,
        key: "location",
        title: "Project location",
        description: "Used to apply regional pricing and brand availability.",
        type: "select",
        options: locations.map((l) => ({ value: l, label: l })),
      },
      {
        step: 3,
        key: "zone",
        title: "Site zone",
        description: "Urban projects have higher logistics costs.",
        type: "select",
        options: [
          { value: "urban", label: "Urban" },
          { value: "rural", label: "Rural" },
        ],
      },
      {
        step: 3,
        key: "qualityLevel",
        title: "Material quality",
        description: "Sets unit pricing tier and brand recommendations across all materials.",
        type: "select",
        options: qualityLevels.map((q) => ({ value: q.value, label: `${q.label} â€” ${q.description}` })),
      },
      {
        step: 3,
        key: "hasElectricity",
        title: "Include full electrical installation?",
        description: "Wiring, panels, outlets, and switches.",
        type: "boolean",
        showWhen: (form) => !["wall", "foundation"].includes(form.projectType || "house"),
      },
      {
        step: 3,
        key: "hasPlumbing",
        title: "Include plumbing?",
        description: "Supply pipes, drains, and wet fixtures.",
        type: "boolean",
        showWhen: (form) => !["wall", "roof"].includes(form.projectType || "house"),
      },
      {
        step: 3,
        key: "hasFinishing",
        title: "Include full finishing?",
        description: "Paint, plaster, tiling, grout, and trim.",
        type: "boolean",
        showWhen: (form) => !["foundation", "roof"].includes(form.projectType || "house"),
      },
      {
        step: 3,
        key: "floorCovering",
        title: "Floor covering",
        description: "Finish type changes material waste and adhesive requirements.",
        type: "select",
        options: [
          { value: "tiles",    label: "Tiles" },
          { value: "wood",     label: "Wood" },
          { value: "laminate", label: "Laminate" },
          { value: "vinyl",    label: "Vinyl" },
          { value: "carpet",   label: "Carpet" },
        ],
        showWhen: (form) => ["room", "renovation"].includes(form.projectType || "house"),
      },
      {
        step: 3,
        key: "renovationLevel",
        title: "Renovation depth",
        description: "Scope affects demolition, replacement rates, and finish intensity.",
        type: "select",
        options: [
          { value: "light",    label: "Light" },
          { value: "medium",   label: "Medium" },
          { value: "complete", label: "Complete" },
        ],
        showWhen: (form) => form.projectType === "renovation",
      },
      {
        step: 3,
        key: "roofSlope",
        title: "Roof slope (degrees)",
        description: "Steeper slope increases actual roof area and framing.",
        type: "number", min: 0, max: 60, stepValue: 1,
        showWhen: (form) => form.projectType === "roof",
      },
      {
        step: 3,
        key: "foundationDepth",
        title: "Foundation depth (m)",
        description: "Deeper foundations increase concrete and excavation scope.",
        type: "number", min: 0.3, max: 3, stepValue: 0.1,
        showWhen: (form) => form.projectType === "foundation",
      },
      {
        step: 3,
        key: "soilType",
        title: "Soil type",
        description: "Soil type affects foundation strategy and structural support.",
        type: "select",
        options: [
          { value: "clay",  label: "Clay" },
          { value: "sand",  label: "Sand" },
          { value: "rock",  label: "Rock" },
          { value: "mixed", label: "Mixed" },
        ],
        showWhen: (form) => form.projectType === "foundation",
      },
      {
        step: 3,
        key: "wallThickness",
        title: "Wall thickness (cm)",
        description: "Thicker walls increase block/brick and mortar consumption.",
        type: "number", min: 10, max: 60, stepValue: 1,
        showWhen: (form) => form.projectType === "wall",
      },
    ]

    return questions.filter((q) => q.step === currentStep && (q.showWhen ? q.showWhen(formData) : true))
  }, [currentStep, formData, projectTypes, qualityLevels])

  const validateStep = (step: number): boolean => {
    const nextErrors: Record<string, string> = {}

    if (step === 1 && !formData.projectType) {
      nextErrors.projectType = "Please choose a project type"
    }
    if (step === 2) {
      if (!formData.length || formData.length <= 0) nextErrors.length = "Required"
      if (!formData.width  || formData.width  <= 0) nextErrors.width  = "Required"
      if (!formData.height || formData.height <= 0) nextErrors.height = "Required"
    }
    if (step === 3 && !formData.location) {
      nextErrors.location = "Please choose a location"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const next = Math.min(currentStep + 1, totalSteps) as 1 | 2 | 3
      setCurrentStep(next)
    }
  }

  const prevStep = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 1) as 1 | 2 | 3)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsCalculating(true)

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Estimation failed")

      const result: EstimateResult = await response.json()
      sessionStorage.setItem("lastEstimate", JSON.stringify(result))
      router.push(`/estimator/results?id=${result.projectId}`)
    } catch (error) {
      console.error("Calculation error:", error)
      try {
        const result: EstimateResult = calculateMaterials(formData as ProjectInput)
        sessionStorage.setItem("lastEstimate", JSON.stringify(result))
        router.push(`/estimator/results?id=${result.projectId}`)
      } catch {
        setErrors({ submit: "An error occurred. Please try again." })
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const renderDetailsStep = () => {
    if (!formData.projectType) return null

    return (
      <div className="space-y-6">
        {renderAdvancedFields()}
      </div>
    )
  }

  const renderAdvancedFields = () => {
    switch (formData.projectType) {
      case "house":
        return renderHouseAdvanced()
      case "extension":
        return renderExtensionAdvanced()
      case "room":
        return renderRoomAdvanced()
      case "wall":
        return renderWallAdvanced()
      case "roof":
        return renderRoofAdvanced()
      case "foundation":
        return renderFoundationAdvanced()
      case "renovation":
        return renderRenovationAdvanced()
      default:
        return null
    }
  }

  const renderHouseAdvanced = () => (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.structure")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={t("estimator.advancedOptions.foundationType")}
            value={formData.foundationType}
            onValueChange={(value) => updateField("foundationType", value as any)}
            options={[
              { value: "slab", label: t("estimator.advancedOptions.slab") },
              { value: "strip", label: t("estimator.advancedOptions.strip") },
              { value: "raft", label: t("estimator.advancedOptions.raft") },
              { value: "piles", label: t("estimator.advancedOptions.piles") },
            ]}
          />
          <SelectField
            label={t("estimator.advancedOptions.structureType")}
            value={formData.structureType}
            onValueChange={(value) => updateField("structureType", value as any)}
            options={[
              { value: "concrete", label: t("estimator.advancedOptions.concrete") },
              { value: "steel", label: t("estimator.advancedOptions.steel") },
              { value: "wood", label: t("estimator.advancedOptions.wood") },
              { value: "mixed", label: t("estimator.advancedOptions.mixed") },
            ]}
          />
          <ToggleField label={t("estimator.advancedOptions.hasGarage")} value={formData.hasGarage} onChange={(value) => updateField("hasGarage", value)} />
          <ToggleField label={t("estimator.advancedOptions.hasBasement")} value={formData.hasBasement} onChange={(value) => updateField("hasBasement", value)} />
        </CardContent>
      </Card>
    </>
  )

  const renderExtensionAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.connection")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleField label={t("estimator.advancedOptions.connectsToExisting")} value={formData.connectsToExisting} onChange={(value) => updateField("connectsToExisting", value)} />
        <ToggleField label={t("estimator.advancedOptions.needsStructuralReinforcement")} value={formData.needsStructuralReinforcement} onChange={(value) => updateField("needsStructuralReinforcement", value)} />
        <ToggleField label={t("estimator.advancedOptions.matchExistingFinishes")} value={formData.matchExistingFinishes} onChange={(value) => updateField("matchExistingFinishes", value)} />
      </CardContent>
    </Card>
  )

  const renderRoomAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.specifications")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectField
          label={t("estimator.advancedOptions.roomType")}
          value={formData.roomType}
          onValueChange={(value) => updateField("roomType", value as any)}
          options={[
            { value: "bedroom", label: t("estimator.advancedOptions.bedroom") },
            { value: "living_room", label: t("estimator.advancedOptions.living_room") },
            { value: "kitchen", label: t("estimator.projectTypes.room") },
            { value: "bathroom", label: t("estimator.advancedOptions.bathroom") },
          ]}
        />
        <SelectField
          label={t("estimator.advancedOptions.floorCovering")}
          value={formData.floorCovering}
          onValueChange={(value) => updateField("floorCovering", value as any)}
          options={[
            { value: "tiles", label: t("estimator.advancedOptions.tiles") },
            { value: "wood", label: t("estimator.advancedOptions.wood") },
            { value: "laminate", label: t("estimator.advancedOptions.laminate") },
            { value: "vinyl", label: t("estimator.advancedOptions.vinyl") },
            { value: "carpet", label: t("estimator.advancedOptions.carpet") },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleField label={t("estimator.advancedOptions.hasFalseCeiling")} value={formData.hasFalseCeiling} onChange={(value) => updateField("hasFalseCeiling", value)} />
          <NumberField label={t("estimator.advancedOptions.electricalPoints")} value={formData.electricalPoints} onChange={(value) => updateField("electricalPoints", value)} placeholder="5" />
        </div>
      </CardContent>
    </Card>
  )

  const renderWallAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.specifications")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label={t("estimator.advancedOptions.wallThickness")} value={formData.wallThickness} onChange={(value) => updateField("wallThickness", value)} placeholder="20" />
          <ToggleField label={t("estimator.advancedOptions.wallNeedsFooting")} value={formData.wallNeedsFooting} onChange={(value) => updateField("wallNeedsFooting", value)} />
        </div>
        <SelectField
          label={t("estimator.advancedOptions.reinforcement")}
          value={formData.reinforcement}
          onValueChange={(value) => updateField("reinforcement", value as any)}
          options={[
            { value: "standard", label: t("estimator.qualityLevels.standard") },
            { value: "reinforced", label: t("estimator.advancedOptions.reinforced") },
          ]}
        />
        <SelectField
          label={t("estimator.advancedOptions.wallFinish")}
          value={formData.wallFinish}
          onValueChange={(value) => updateField("wallFinish", value as any)}
          options={[
            { value: "raw", label: t("estimator.advancedOptions.raw") },
            { value: "plastered", label: t("estimator.advancedOptions.plastered") },
            { value: "painted", label: t("estimator.advancedOptions.painted") },
          ]}
        />
      </CardContent>
    </Card>
  )

  const renderRoofAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.specifications")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NumberField label={t("estimator.advancedOptions.roofSlope")} value={formData.roofSlope} onChange={(value) => updateField("roofSlope", value)} placeholder="25" />
        <div className="grid gap-4 sm:grid-cols-3">
          <ToggleField label={t("estimator.advancedOptions.needsLoadBearing")} value={formData.needsLoadBearing} onChange={(value) => updateField("needsLoadBearing", value)} />
          <ToggleField label={t("estimator.advancedOptions.needsInsulation")} value={formData.needsInsulation} onChange={(value) => updateField("needsInsulation", value)} />
          <ToggleField label={t("estimator.advancedOptions.needsWaterproofing")} value={formData.needsWaterproofing} onChange={(value) => updateField("needsWaterproofing", value)} />
        </div>
      </CardContent>
    </Card>
  )

  const renderFoundationAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.specifications")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <NumberField label={t("estimator.advancedOptions.foundationDepth")} value={formData.foundationDepth} onChange={(value) => updateField("foundationDepth", value)} placeholder="0.5" step={0.1} />
        <SelectField
          label={t("estimator.advancedOptions.soilType")}
          value={formData.soilType}
          onValueChange={(value) => updateField("soilType", value as any)}
          options={[
            { value: "clay", label: t("estimator.advancedOptions.clay") },
            { value: "sand", label: t("estimator.advancedOptions.sand") },
            { value: "rock", label: t("estimator.advancedOptions.rock") },
            { value: "mixed", label: t("estimator.advancedOptions.mixed") },
          ]}
        />
        <SelectField
          label={t("estimator.advancedOptions.concreteClass")}
          value={formData.concreteClass}
          onValueChange={(value) => updateField("concreteClass", value as any)}
          options={[
            { value: "C20", label: "C20/25" },
            { value: "C25", label: "C25/30" },
            { value: "C30", label: "C30/37" },
          ]}
        />
        <NumberField label={t("estimator.advancedOptions.reinforcementRate")} value={formData.reinforcementRate} onChange={(value) => updateField("reinforcementRate", value)} placeholder="80" />
      </CardContent>
    </Card>
  )

  const renderRenovationAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{t("estimator.advancedOptions.workScope")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectField
          label={t("estimator.advancedOptions.renovationLevel")}
          value={formData.renovationLevel}
          onValueChange={(value) => updateField("renovationLevel", value as any)}
          options={[
            { value: "light", label: t("estimator.advancedOptions.light") },
            { value: "medium", label: t("estimator.advancedOptions.medium") },
            { value: "complete", label: t("estimator.advancedOptions.complete") },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleField label={t("estimator.advancedOptions.needsDemolition")} value={formData.needsDemolition} onChange={(value) => updateField("needsDemolition", value)} />
          <ToggleField label={t("estimator.advancedOptions.replaceElectrical")} value={formData.replaceElectrical} onChange={(value) => updateField("replaceElectrical", value)} />
          <ToggleField label={t("estimator.advancedOptions.replacePlumbing")} value={formData.replacePlumbing} onChange={(value) => updateField("replacePlumbing", value)} />
          <ToggleField label={t("estimator.advancedOptions.hasFinishing")} value={formData.hasFinishing} onChange={(value) => updateField("hasFinishing", value)} />
        </div>
      </CardContent>
    </Card>
  )

  const renderStepContent = () => {
    if (currentStep === 3) return renderDetailsStep()
    return null
  }

  const renderSmartQuestionPanel = () => {
    // Step 1 â†’ visual project-type card grid
    if (currentStep === 1) {
      return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>What are you building?</CardTitle>
            <CardDescription>Choose a project type â€” questions and calculations adapt to your choice.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {projectTypes.map((pt) => {
                const Icon = pt.icon
                const isSelected = formData.projectType === pt.value
                return (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => handleSelectAnswer({ step: 1, key: "projectType", title: "", description: "", type: "select" } as SmartQuestion, pt.value)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all hover:border-primary/60 hover:bg-primary/5 ${
                      isSelected ? "border-primary bg-primary/10 shadow-md" : "border-border bg-background"
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold leading-tight text-foreground">{pt.label}</span>
                    <span className="text-xs leading-snug text-muted-foreground">{pt.description}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Steps 2-3 â†’ adaptive question panel (no floor plan)
    const area = formData.length && formData.width
      ? (formData.length * formData.width).toFixed(1) : null
    const totalArea = area && formData.numberOfFloors && formData.numberOfFloors > 1
      ? (parseFloat(area) * formData.numberOfFloors).toFixed(1) : null
    const perimeter = formData.length && formData.width
      ? (2 * (formData.length + formData.width)).toFixed(1) : null
    const projLabel = projectTypes.find((p) => p.value === formData.projectType)?.label ?? "project"

    return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
          {currentStep === 2 ? "Dimensions & Space" : "Quality & Services"}
        </CardTitle>
        <CardDescription>
          {currentStep === 2
            ? `Dimensions for your ${projLabel.toLowerCase()}. Calculations update as you type.`
            : `Location and quality settings for your ${projLabel.toLowerCase()}.`}
        </CardDescription>
        {/* Context badges */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {projLabel}
          </span>
          {formData.qualityLevel && (
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs capitalize text-muted-foreground">
              {formData.qualityLevel} quality
            </span>
          )}
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            {smartQuestions.length} questions
          </span>
        </div>
        {/* Live stats â€” step 2 only, once dimensions start filling in */}
        {currentStep === 2 && (area ?? perimeter) && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {area && (
                <span>
                  <span className="font-semibold text-primary">{area} mÂ²</span>{" "}
                  <span className="text-muted-foreground">floor area</span>
                </span>
              )}
              {totalArea && (
                <span>
                  <span className="font-semibold text-primary">{totalArea} mÂ²</span>{" "}
                  <span className="text-muted-foreground">total ({formData.numberOfFloors} floors)</span>
                </span>
              )}
              {perimeter && (
                <span>
                  <span className="font-semibold text-primary">{perimeter} m</span>{" "}
                  <span className="text-muted-foreground">perimeter</span>
                </span>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {smartQuestions.map((question, index) => {
            const currentValue = formData[question.key]
            const errorMessage = errors[String(question.key)]
            const isAnswered = currentValue !== undefined && currentValue !== null && currentValue !== ""

            return (
              <div
                key={`${String(question.key)}-${index}`}
                className={`rounded-xl border p-4 shadow-sm transition-colors ${
                  isAnswered ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary/80">Q{index + 1}</p>
                  {isAnswered && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{question.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{question.description}</p>

                <div className="mt-3 space-y-2">
                  {question.type === "number" && (
                    <Input
                      type="number"
                      min={question.min}
                      max={question.max}
                      step={question.stepValue}
                      value={typeof currentValue === "number" ? currentValue : ""}
                      onChange={(event) => {
                        const parsed = question.stepValue && question.stepValue < 1
                          ? parseFloat(event.target.value)
                          : parseInt(event.target.value, 10)
                        if (!Number.isNaN(parsed)) {
                          updateField(question.key, parsed as never)
                        }
                      }}
                      className="h-11 text-base"
                    />
                  )}

                  {question.type === "select" && question.options && (
                    <Select
                      value={typeof currentValue === "string" ? currentValue : undefined}
                      onValueChange={(value) => handleSelectAnswer(question, value)}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {question.type === "boolean" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant={currentValue === true ? "default" : "outline"} onClick={() => updateField(question.key, true as never)}>
                        Yes
                      </Button>
                      <Button type="button" variant={currentValue === false ? "default" : "outline"} onClick={() => updateField(question.key, false as never)}>
                        No
                      </Button>
                    </div>
                  )}

                  {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
                </div>
              </div>
            )
          })}

          {smartQuestions.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              No more prompts are needed in this step. Continue to the next step.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    )
  } // end renderSmartQuestionPanel

  return (
    <div className="mx-auto max-w-6xl">
      {/* â”€â”€ Page header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
          <Calculator className="h-4 w-4" />
          <span className="text-sm font-medium">Material Estimator</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-secondary md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          {t("estimator.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("estimator.subtitle")}</p>
      </div>

      {/* Step indicator */}
          <div className="mb-10">
            <div className="mb-4 flex flex-wrap justify-between gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="min-w-[110px] flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      currentStep === step
                        ? "scale-110 bg-primary text-primary-foreground shadow-lg"
                        : currentStep > step
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                    </div>
                    <div className={`text-center text-xs font-medium transition-colors md:text-sm ${currentStep >= step ? "text-primary" : "text-muted-foreground"}`}>
                      {getStepLabel(step)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-3 rounded-full" />
          </div>

      {/* Question panel â€” full-width centred */}
      <div className="mb-6 mx-auto w-full max-w-2xl">
        {renderSmartQuestionPanel()}
      </div>

      {/* Form: advanced options (step 3) + navigation */}
      <form onSubmit={(event) => { event.preventDefault(); nextStep() }}>
        <div className="mx-auto max-w-2xl space-y-6">
          {renderStepContent()}

              <div className="flex flex-col justify-between gap-3 pt-4 sm:flex-row sm:gap-4">
          {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="h-12 flex-1 border-2 hover:border-primary" size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                {t("estimator.previous") || "Previous"}
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="submit" className="ml-auto h-12 flex-1 text-base shadow-lg hover:shadow-xl" size="lg">
                {t("estimator.next") || "Next"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleSubmit()} disabled={isCalculating} className="ml-auto h-12 flex-1 text-base shadow-lg hover:shadow-xl" size="lg">
                {isCalculating
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Calculatingâ€¦</>
                  : <><Calculator className="mr-2 h-5 w-5" />Get Estimate</>}
              </Button>
            )}
          </div>

          {errors.submit && (
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center text-destructive">
              {errors.submit}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

const SelectField = ({ label, value, onValueChange, options }: any) => {
  const { t } = useLocale()

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={`${t("estimator.advancedOptions.small")}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: any) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const NumberField = ({ label, value, onChange, placeholder, step = 1 }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type="number"
      step={step}
      min="0"
      placeholder={placeholder}
      value={value || ""}
      onChange={(event) => onChange(step < 1 ? parseFloat(event.target.value) || undefined : parseInt(event.target.value, 10) || undefined)}
    />
  </div>
)

const ToggleField = ({ label, value, onChange }: any) => {
  const { t } = useLocale()

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
            value === true ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/50"
          }`}
        >
          {t("estimator.advancedOptions.yes")}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
            value === false ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/50"
          }`}
        >
          {t("estimator.advancedOptions.no")}
        </button>
      </div>
    </div>
  )
}
