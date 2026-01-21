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
  "United States - Northeast",
  "United States - Southeast", 
  "United States - Midwest",
  "United States - Southwest",
  "United States - West Coast",
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
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('steps.mode')}
        </CardTitle>
        <CardDescription>{t('estimator.estimationModes.simpleDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={formData.estimationMode || 'simple'} onValueChange={(value) => updateField("estimationMode", value as EstimationMode)}>
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="simple" className="flex flex-col items-start p-4 h-auto">
              <span className="text-lg font-semibold">{t('estimator.estimationModes.simple')}</span>
              <span className="text-xs text-muted-foreground mt-1">{t('estimator.estimationModes.simpleDesc')}</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex flex-col items-start p-4 h-auto">
              <span className="text-lg font-semibold">{t('estimator.estimationModes.advanced')}</span>
              <span className="text-xs text-muted-foreground mt-1">{t('estimator.estimationModes.advancedDesc')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )

  const renderProjectTypeStep = () => (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('steps.projectType')}
        </CardTitle>
        <CardDescription>Select the type of construction project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projectTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateField("projectType", type.value)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  formData.projectType === type.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Icon className="h-8 w-8 mb-2 text-primary" />
                <p className="font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                  {type.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </button>
            )
          })}
        </div>
        {errors.projectType && <p className="mt-2 text-sm text-destructive">{errors.projectType}</p>}
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
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.advancedOptions.dimensions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="length">{t('estimator.length')} (m)</Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              min="0"
              placeholder="10"
              value={formData.length || ""}
              onChange={(e) => updateField("length", parseFloat(e.target.value) || 0)}
              className={errors.length ? "border-destructive" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">{t('estimator.width')} (m)</Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0"
              placeholder="10"
              value={formData.width || ""}
              onChange={(e) => updateField("width", parseFloat(e.target.value) || 0)}
              className={errors.width ? "border-destructive" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">{t('estimator.height')} (m)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0"
              placeholder="3"
              value={formData.height || ""}
              onChange={(e) => updateField("height", parseFloat(e.target.value) || 0)}
              className={errors.height ? "border-destructive" : ""}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('estimator.area')}: <span className="font-medium">{((formData.length || 0) * (formData.width || 0)).toFixed(1)} m²</span>
        </p>
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
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('steps.location')}
        </CardTitle>
        <CardDescription>Final details for accurate pricing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('estimator.location')}</Label>
            <Select value={formData.location} onValueChange={(value) => updateField("location", value)}>
              <SelectTrigger className={errors.location ? "border-destructive" : ""}>
                <SelectValue placeholder={t('estimator.selectRegion')} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>{t('estimator.advancedOptions.zone')}</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateField("zone", "urban")}
                className={`flex-1 rounded-lg border-2 px-4 py-2 transition-all ${
                  formData.zone === "urban" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                {t('estimator.advancedOptions.urban')}
              </button>
              <button
                type="button"
                onClick={() => updateField("zone", "rural")}
                className={`flex-1 rounded-lg border-2 px-4 py-2 transition-all ${
                  formData.zone === "rural" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                {t('estimator.advancedOptions.rural')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('estimator.qualityLevel')}</Label>
          <div className="grid grid-cols-3 gap-2">
            {qualityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateField("qualityLevel", level.value)}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  formData.qualityLevel === level.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                title={level.description}
              >
                <p className="font-semibold">{level.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold text-secondary md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          {t('estimator.title')}
        </h1>
        <p className="text-muted-foreground">{t('estimator.calculate')}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 text-center">
              <div className={`text-sm font-medium ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}>
                {t(`steps.${['mode', 'projectType', 'details', 'location'][step - 1]}`)}
              </div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); currentStep === totalSteps ? handleSubmit() : nextStep() }}>
        <div className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button type="submit" className="flex-1 ml-auto">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isCalculating} className="flex-1 ml-auto">
                {isCalculating ? (
                  <>
                    <Calculator className="mr-2 h-5 w-5 animate-pulse" />
                    {t('estimator.calculating')}
                  </>
                ) : (
                  <>
                    {t('estimator.calculate')}
                    <ArrowRight className="ml-2 h-5 w-5" />
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
