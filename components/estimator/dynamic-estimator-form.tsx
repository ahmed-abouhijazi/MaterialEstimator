"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calculator, ArrowRight, ArrowLeft, Home, Plus, Layers, Hammer, Building, Mountain, Wrench } from "lucide-react"
import { calculateMaterials, type ProjectInput, type ProjectType, type QualityLevel, type EstimationMode, type EstimateResult } from "@/lib/calculations"

const projectIcons: Record<ProjectType, any> = {
  house: Home,
  extension: Plus,
  room: Layers,
  wall: Hammer,
  roof: Building,
  foundation: Mountain,
  renovation: Wrench,
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
  const [currentStep, setCurrentStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<Partial<ProjectInput>>({
    estimationMode: "simple",
    qualityLevel: "standard",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100
  const stepLabels = ['mode', 'projectType', 'details', 'location']

  const projectTypes: { value: ProjectType; label: string; description: string; icon: any }[] = [
    { value: "house", label: t('estimator.projectTypes.house'), description: t('estimator.projectTypes.houseDesc'), icon: Home },
    { value: "extension", label: t('estimator.projectTypes.extension'), description: t('estimator.projectTypes.extensionDesc'), icon: Plus },
    { value: "room", label: t('estimator.projectTypes.room'), description: t('estimator.projectTypes.roomDesc'), icon: Layers },
    { value: "wall", label: t('estimator.projectTypes.wall'), description: t('estimator.projectTypes.wallDesc'), icon: Hammer },
    { value: "roof", label: t('estimator.projectTypes.roof'), description: t('estimator.projectTypes.roofDesc'), icon: Building },
    { value: "foundation", label: t('estimator.projectTypes.foundation'), description: t('estimator.projectTypes.foundationDesc'), icon: Mountain },
    { value: "renovation", label: t('estimator.projectTypes.renovation'), description: t('estimator.projectTypes.renovationDesc'), icon: Wrench },
  ]

  const qualityLevels: { value: QualityLevel; label: string; description: string }[] = [
    { value: "basic", label: t('estimator.qualityLevels.basic'), description: t('estimator.qualityLevels.basicDesc') },
    { value: "standard", label: t('estimator.qualityLevels.standard'), description: t('estimator.qualityLevels.standardDesc') },
    { value: "premium", label: t('estimator.qualityLevels.premium'), description: t('estimator.qualityLevels.premiumDesc') },
  ]

  const updateField = <K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1 && !formData.estimationMode) {
      newErrors.estimationMode = "Please select an estimation mode"
    }
    if (step === 2 && !formData.projectType) {
      newErrors.projectType = "Please select a project type"
    }
    if (step === 3) {
      if (!formData.length || formData.length <= 0) newErrors.length = "Required"
      if (!formData.width || formData.width <= 0) newErrors.width = "Required"
      if (!formData.height || formData.height <= 0) newErrors.height = "Required"
    }
    if (step === 4 && !formData.location) {
      newErrors.location = "Please select a location"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsCalculating(true)

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Estimation failed')

      const result: EstimateResult = await response.json()
      sessionStorage.setItem("lastEstimate", JSON.stringify(result))
      router.push(`/estimator/results?id=${result.projectId}`)
    } catch (error) {
      console.error("Calculation error:", error)
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderModeStep()
      case 2:
        return renderProjectTypeStep()
      case 3:
        return renderDetailsStep()
      case 4:
        return renderLocationStep()
      default:
        return null
    }
  }

  const renderModeStep = () => (
    <Card className="border-2 border-border shadow-lg">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.steps.mode')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('estimator.estimationModes.description') || 'Choose the level of detail for your estimate'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => updateField("estimationMode", "simple")}
            className={`group rounded-xl border-2 p-6 text-left transition-all duration-300 ${
              formData.estimationMode === 'simple'
                ? "border-primary bg-primary/5 shadow-lg scale-105"
                : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                formData.estimationMode === 'simple' ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {t('estimator.estimationModes.simple')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('estimator.estimationModes.simpleDesc')}
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField("estimationMode", "advanced")}
            className={`group rounded-xl border-2 p-6 text-left transition-all duration-300 ${
              formData.estimationMode === 'advanced'
                ? "border-primary bg-primary/5 shadow-lg scale-105"
                : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                formData.estimationMode === 'advanced' ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {t('estimator.estimationModes.advanced')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('estimator.estimationModes.advancedDesc')}
                </p>
              </div>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  )

  const renderProjectTypeStep = () => (
    <Card className="border-2 border-border shadow-lg">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.steps.projectType')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('estimator.selectProjectType') || 'Choose what you want to build'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projectTypes.map((type) => {
            const Icon = type.icon
            const isSelected = formData.projectType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateField("projectType", type.value)}
                className={`group rounded-xl border-2 p-5 text-left transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg scale-105"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                  isSelected ? 'bg-primary/10' : 'bg-muted group-hover:bg-primary/5'
                }`}>
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-base mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                  {type.label}
                </p>
                <p className="text-sm text-muted-foreground leading-snug">{type.description}</p>
              </button>
            )
          })}
        </div>
        {errors.projectType && (
          <p className="mt-4 text-sm text-destructive font-medium">{errors.projectType}</p>
        )}
      </CardContent>
    </Card>
  )

  const renderDetailsStep = () => {
    const mode = formData.estimationMode || 'simple'
    const projectType = formData.projectType

    return (
      <div className="space-y-6">
        {renderDimensionsCard()}
        {mode === 'advanced' && projectType && renderAdvancedFields()}
      </div>
    )
  }

  const renderDimensionsCard = () => (
    <Card className="border-2 border-border shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.advancedOptions.dimensions')}
        </CardTitle>
        <CardDescription>
          {t('estimator.enterDimensions') || 'Enter the dimensions of your project'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="length" className="text-base font-medium">
              {t('estimator.length')} (m)
            </Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              min="0"
              placeholder="10.0"
              value={formData.length || ""}
              onChange={(e) => updateField("length", parseFloat(e.target.value) || 0)}
              className={`h-12 text-base ${errors.length ? "border-destructive" : "border-2"}`}
            />
            {errors.length && <p className="text-xs text-destructive">{errors.length}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="width" className="text-base font-medium">
              {t('estimator.width')} (m)
            </Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0"
              placeholder="10.0"
              value={formData.width || ""}
              onChange={(e) => updateField("width", parseFloat(e.target.value) || 0)}
              className={`h-12 text-base ${errors.width ? "border-destructive" : "border-2"}`}
            />
            {errors.width && <p className="text-xs text-destructive">{errors.width}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="text-base font-medium">
              {t('estimator.height')} (m)
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0"
              placeholder="3.0"
              value={formData.height || ""}
              onChange={(e) => updateField("height", parseFloat(e.target.value) || 0)}
              className={`h-12 text-base ${errors.height ? "border-destructive" : "border-2"}`}
            />
            {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
          </div>
        </div>
        <div className="mt-5 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
          <p className="text-sm text-muted-foreground">
            {t('estimator.area')}: <span className="text-lg font-bold text-primary">{((formData.length || 0) * (formData.width || 0)).toFixed(1)} m²</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderAdvancedFields = () => {
    const projectType = formData.projectType

    switch (projectType) {
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
          <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.structure')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={t('estimator.advancedOptions.foundationType')}
              value={formData.foundationType}
              onValueChange={(value) => updateField("foundationType", value as any)}
              options={[
                { value: "slab", label: t('estimator.advancedOptions.slab') },
                { value: "strip", label: t('estimator.advancedOptions.strip') },
                { value: "raft", label: t('estimator.advancedOptions.raft') },
                { value: "piles", label: t('estimator.advancedOptions.piles') },
              ]}
            />
            <SelectField
              label={t('estimator.advancedOptions.structureType')}
              value={formData.structureType}
              onValueChange={(value) => updateField("structureType", value as any)}
              options={[
                { value: "concrete", label: t('estimator.advancedOptions.concrete') },
                { value: "steel", label: t('estimator.advancedOptions.steel') },
                { value: "wood", label: t('estimator.advancedOptions.wood') },
                { value: "mixed", label: t('estimator.advancedOptions.mixed') },
              ]}
            />
            <SelectField
              label={t('estimator.advancedOptions.wallType')}
              value={formData.wallType}
              onValueChange={(value) => updateField("wallType", value as any)}
              options={[
                { value: "concrete_blocks", label: t('estimator.advancedOptions.concrete_blocks') },
                { value: "bricks", label: t('estimator.advancedOptions.bricks') },
                { value: "wood_frame", label: t('estimator.advancedOptions.wood_frame') },
                { value: "stone", label: t('estimator.advancedOptions.stone') },
              ]}
            />
            <SelectField
              label={t('estimator.advancedOptions.roofType')}
              value={formData.roofType}
              onValueChange={(value) => updateField("roofType", value as any)}
              options={[
                { value: "flat", label: t('estimator.advancedOptions.flat') },
                { value: "pitched", label: t('estimator.advancedOptions.pitched') },
                { value: "mansard", label: t('estimator.advancedOptions.mansard') },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.equipment')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <ToggleField
              label={t('estimator.advancedOptions.hasElectricity')}
              value={formData.hasElectricity}
              onChange={(value) => updateField("hasElectricity", value)}
            />
            <ToggleField
              label={t('estimator.advancedOptions.hasPlumbing')}
              value={formData.hasPlumbing}
              onChange={(value) => updateField("hasPlumbing", value)}
            />
            <ToggleField
              label={t('estimator.advancedOptions.hasFinishing')}
              value={formData.hasFinishing}
              onChange={(value) => updateField("hasFinishing", value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              label={t('estimator.advancedOptions.numberOfRooms')}
              value={formData.numberOfRooms}
              onChange={(value) => updateField("numberOfRooms", value)}
              placeholder="3"
            />
            <NumberField
              label={t('estimator.advancedOptions.numberOfBathrooms')}
              value={formData.numberOfBathrooms}
              onChange={(value) => updateField("numberOfBathrooms", value)}
              placeholder="2"
            />
            <NumberField
              label={t('estimator.advancedOptions.numberOfFloors')}
              value={formData.numberOfFloors}
              onChange={(value) => updateField("numberOfFloors", value)}
              placeholder="1"
            />
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderExtensionAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.connection')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleField
          label={t('estimator.advancedOptions.connectsToExisting')}
          value={formData.connectsToExisting}
          onChange={(value) => updateField("connectsToExisting", value)}
        />
        <ToggleField
          label={t('estimator.advancedOptions.needsStructuralReinforcement')}
          value={formData.needsStructuralReinforcement}
          onChange={(value) => updateField("needsStructuralReinforcement", value)}
        />
        <ToggleField
          label={t('estimator.advancedOptions.matchExistingFinishes')}
          value={formData.matchExistingFinishes}
          onChange={(value) => updateField("matchExistingFinishes", value)}
        />
      </CardContent>
    </Card>
  )

  const renderRoomAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.specifications')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectField
          label={t('estimator.advancedOptions.roomType')}
          value={formData.roomType}
          onValueChange={(value) => updateField("roomType", value as any)}
          options={[
            { value: "bedroom", label: t('estimator.advancedOptions.bedroom') },
            { value: "living_room", label: t('estimator.advancedOptions.living_room') },
            { value: "kitchen", label: t('estimator.projectTypes.room') },
            { value: "bathroom", label: t('estimator.advancedOptions.bathroom') },
          ]}
        />
        <SelectField
          label={t('estimator.advancedOptions.floorCovering')}
          value={formData.floorCovering}
          onValueChange={(value) => updateField("floorCovering", value as any)}
          options={[
            { value: "tiles", label: t('estimator.advancedOptions.tiles') },
            { value: "wood", label: t('estimator.advancedOptions.wood') },
            { value: "laminate", label: t('estimator.advancedOptions.laminate') },
            { value: "vinyl", label: t('estimator.advancedOptions.vinyl') },
            { value: "carpet", label: t('estimator.advancedOptions.carpet') },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleField
            label={t('estimator.advancedOptions.hasFalseCeiling')}
            value={formData.hasFalseCeiling}
            onChange={(value) => updateField("hasFalseCeiling", value)}
          />
          <NumberField
            label={t('estimator.advancedOptions.electricalPoints')}
            value={formData.electricalPoints}
            onChange={(value) => updateField("electricalPoints", value)}
            placeholder="5"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderWallAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.specifications')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label={t('estimator.advancedOptions.wallThickness')}
            value={formData.wallThickness}
            onChange={(value) => updateField("wallThickness", value)}
            placeholder="20"
          />
          <ToggleField
            label={t('estimator.advancedOptions.wallNeedsFooting')}
            value={formData.wallNeedsFooting}
            onChange={(value) => updateField("wallNeedsFooting", value)}
          />
        </div>
        <SelectField
          label={t('estimator.advancedOptions.reinforcement')}
          value={formData.reinforcement}
          onValueChange={(value) => updateField("reinforcement", value as any)}
          options={[
            { value: "standard", label: t('estimator.qualityLevels.standard') },
            { value: "reinforced", label: t('estimator.advancedOptions.reinforced') },
          ]}
        />
        <SelectField
          label={t('estimator.advancedOptions.wallFinish')}
          value={formData.wallFinish}
          onValueChange={(value) => updateField("wallFinish", value as any)}
          options={[
            { value: "raw", label: t('estimator.advancedOptions.raw') },
            { value: "plastered", label: t('estimator.advancedOptions.plastered') },
            { value: "painted", label: t('estimator.advancedOptions.painted') },
          ]}
        />
      </CardContent>
    </Card>
  )

  const renderRoofAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.specifications')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NumberField
          label={t('estimator.advancedOptions.roofSlope')}
          value={formData.roofSlope}
          onChange={(value) => updateField("roofSlope", value)}
          placeholder="25"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <ToggleField
            label={t('estimator.advancedOptions.needsLoadBearing')}
            value={formData.needsLoadBearing}
            onChange={(value) => updateField("needsLoadBearing", value)}
          />
          <ToggleField
            label={t('estimator.advancedOptions.needsInsulation')}
            value={formData.needsInsulation}
            onChange={(value) => updateField("needsInsulation", value)}
          />
          <ToggleField
            label={t('estimator.advancedOptions.needsWaterproofing')}
            value={formData.needsWaterproofing}
            onChange={(value) => updateField("needsWaterproofing", value)}
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderFoundationAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.specifications')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label={t('estimator.advancedOptions.foundationDepth')}
            value={formData.foundationDepth}
            onChange={(value) => updateField("foundationDepth", value)}
            placeholder="0.5"
            step={0.1}
          />
          <SelectField
            label={t('estimator.advancedOptions.soilType')}
            value={formData.soilType}
            onValueChange={(value) => updateField("soilType", value as any)}
            options={[
              { value: "clay", label: t('estimator.advancedOptions.clay') },
              { value: "sand", label: t('estimator.advancedOptions.sand') },
              { value: "rock", label: t('estimator.advancedOptions.rock') },
              { value: "mixed", label: t('estimator.advancedOptions.mixed') },
            ]}
          />
          <SelectField
            label={t('estimator.advancedOptions.concreteClass')}
            value={formData.concreteClass}
            onValueChange={(value) => updateField("concreteClass", value as any)}
            options={[
              { value: "C20", label: "C20/25" },
              { value: "C25", label: "C25/30" },
              { value: "C30", label: "C30/37" },
            ]}
          />
          <NumberField
            label={t('estimator.advancedOptions.reinforcementRate')}
            value={formData.reinforcementRate}
            onChange={(value) => updateField("reinforcementRate", value)}
            placeholder="80"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderRenovationAdvanced = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{t('estimator.advancedOptions.workScope')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectField
          label={t('estimator.advancedOptions.renovationLevel')}
          value={formData.renovationLevel}
          onValueChange={(value) => updateField("renovationLevel", value as any)}
          options={[
            { value: "light", label: t('estimator.advancedOptions.light') },
            { value: "medium", label: t('estimator.advancedOptions.medium') },
            { value: "complete", label: t('estimator.advancedOptions.complete') },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleField
            label={t('estimator.advancedOptions.needsDemolition')}
            value={formData.needsDemolition}
            onChange={(value) => updateField("needsDemolition", value)}
          />
          <ToggleField
            label={t('estimator.advancedOptions.replaceElectrical')}
            value={formData.replaceElectrical}
            onChange={(value) => updateField("replaceElectrical", value)}
          />
          <ToggleField
            label={t('estimator.advancedOptions.replacePlumbing')}
            value={formData.replacePlumbing}
            onChange={(value) => updateField("replacePlumbing", value)}
          />
          <ToggleField
            label={t('estimator.advancedOptions.hasFinishing')}
            value={formData.hasFinishing}
            onChange={(value) => updateField("hasFinishing", value)}
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderLocationStep = () => (
    <Card className="border-2 border-border shadow-lg">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.steps.location')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('estimator.locationDescription') || 'Choose your location and material quality for accurate pricing'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-base font-medium">{t('estimator.location')}</Label>
            <Select value={formData.location} onValueChange={(value) => updateField("location", value)}>
              <SelectTrigger className={`h-12 text-base border-2 ${errors.location ? "border-destructive" : ""}`}>
                <SelectValue placeholder={t('estimator.selectRegion')} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && <p className="text-sm text-destructive font-medium mt-1">{errors.location}</p>}
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium">{t('estimator.advancedOptions.zone')}</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateField("zone", "urban")}
                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  formData.zone === "urban" ? "border-primary bg-primary/10 text-primary shadow-md" : "border-border hover:border-primary/50"
                }`}
              >
                {t('estimator.advancedOptions.urban')}
              </button>
              <button
                type="button"
                onClick={() => updateField("zone", "rural")}
                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  formData.zone === "rural" ? "border-primary bg-primary/10 text-primary shadow-md" : "border-border hover:border-primary/50"
                }`}
              >
                {t('estimator.advancedOptions.rural')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">{t('estimator.qualityLevel')}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {qualityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateField("qualityLevel", level.value)}
                className={`rounded-xl border-2 p-5 text-center transition-all duration-300 ${
                  formData.qualityLevel === level.value
                    ? "border-primary bg-primary/5 shadow-lg scale-105"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
                title={level.description}
              >
                <p className="font-bold text-base mb-2">{level.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 border border-primary/20">
          <Calculator className="h-4 w-4" />
          <span className="text-sm font-medium">Material Estimator</span>
        </div>
        <h1 className="mb-4 text-4xl md:text-5xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('estimator.subtitle')}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex flex-wrap justify-between gap-2 mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 min-w-[100px]">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep === step 
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                    : currentStep > step 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                <div className={`text-xs md:text-sm font-medium text-center transition-colors ${
                  currentStep >= step ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {t(`estimator.steps.${stepLabels[step - 1]}`)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-3 rounded-full" />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); currentStep === totalSteps ? handleSubmit() : nextStep() }}>
        <div className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                className="flex-1 h-12 text-base border-2 hover:border-primary"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                {t('estimator.previous') || 'Previous'}
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button 
                type="submit" 
                className="flex-1 ml-auto h-12 text-base shadow-lg hover:shadow-xl" 
                size="lg"
              >
                {t('estimator.next') || 'Next'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isCalculating} 
                className="flex-1 ml-auto h-12 text-base shadow-lg hover:shadow-xl"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <Calculator className="mr-2 h-5 w-5 animate-pulse" />
                    {t('estimator.calculating')}
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-5 w-5" />
                    {t('estimator.calculate')}
                  </>
                )}
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

// Helper Components
const SelectField = ({ label, value, onValueChange, options }: any) => {
  const { t } = useLocale()
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={`${t('estimator.advancedOptions.small')}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
      onChange={(e) => onChange(parseInt(e.target.value) || undefined)}
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
          {t('estimator.advancedOptions.yes')}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm transition-all ${
            value === false ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/50"
          }`}
        >
          {t('estimator.advancedOptions.no')}
        </button>
      </div>
    </div>
  )
}
