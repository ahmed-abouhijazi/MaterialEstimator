// Construction material calculation engine using deterministic formulas
// These are industry-standard calculation methods, not AI guessing

export type ProjectType = 
  | "house" 
  | "room" 
  | "wall" 
  | "roof" 
  | "extension" 
  | "foundation" 
  | "renovation"

export type QualityLevel = "basic" | "standard" | "premium"

export type EstimationMode = "simple" | "advanced"

export interface ProjectInput {
  projectType: ProjectType
  length: number // in meters
  width: number // in meters
  height: number // in meters
  location: string
  qualityLevel: QualityLevel
  estimationMode?: EstimationMode
  zone?: "urban" | "rural"

  // 3D + layout preferences (used by planner/AI hints)
  layoutIntent?: "open" | "balanced" | "zoned"
  styleMood?: "modern" | "warm" | "scandi" | "industrial"
  furnitureDensity?: "minimal" | "balanced" | "cozy"
  lightingMood?: "bright" | "neutral" | "cozy"
  hasBalcony?: boolean
  pro3dMode?: boolean
  showFurniture?: boolean
  
  // Advanced mode fields - General
  numberOfRooms?: number
  numberOfBathrooms?: number
  numberOfFloors?: number
  hasBasement?: boolean
  hasGarage?: boolean
  kitchenSize?: "small" | "medium" | "large"
  
  // House specific
  foundationType?: "slab" | "strip" | "raft" | "piles"
  structureType?: "concrete" | "steel" | "wood" | "mixed"
  wallType?: "concrete_blocks" | "bricks" | "wood_frame" | "stone"
  roofType?: "flat" | "pitched" | "mansard"
  hasElectricity?: boolean
  hasPlumbing?: boolean
  hasFinishing?: boolean
  
  // Extension specific
  connectsToExisting?: boolean
  needsStructuralReinforcement?: boolean
  matchExistingFinishes?: boolean
  
  // Single room specific
  roomType?: "bedroom" | "living_room" | "kitchen" | "bathroom"
  floorCovering?: "tiles" | "wood" | "laminate" | "vinyl" | "carpet"
  hasFalseCeiling?: boolean
  electricalPoints?: number
  
  // Wall specific
  wallThickness?: number // in cm
  wallNeedsFooting?: boolean
  reinforcement?: "standard" | "reinforced"
  wallFinish?: "raw" | "plastered" | "painted"
  
  // Roof specific
  roofSlope?: number // in degrees
  needsLoadBearing?: boolean
  needsInsulation?: boolean
  needsWaterproofing?: boolean
  
  // Foundation specific
  foundationDepth?: number // in meters
  soilType?: "clay" | "sand" | "rock" | "mixed"
  concreteClass?: "C20" | "C25" | "C30"
  reinforcementRate?: number // kg per m3
  
  // Renovation specific
  needsDemolition?: boolean
  replaceElectrical?: boolean
  replacePlumbing?: boolean
  renovationLevel?: "light" | "medium" | "complete"
}

export interface MaterialItem {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  category: string
  recommendedBrand?: string
  selectedBrand?: string
  brandMultiplier?: number
}

export interface EstimateResult {
  materials: MaterialItem[]
  subtotal: number
  wasteBuffer: number
  wasteBufferPercentage: number
  total: number
  projectDetails: ProjectInput
  generatedAt: Date
  projectId: string
}

// Base prices per unit (can be adjusted per region)
const basePrices: Record<string, Record<QualityLevel, number>> = {
  cement: { basic: 8, standard: 10, premium: 14 },
  sand: { basic: 25, standard: 30, premium: 40 },
  gravel: { basic: 30, standard: 35, premium: 45 },
  steel: { basic: 800, standard: 950, premium: 1200 },
  bricks: { basic: 0.35, standard: 0.50, premium: 0.85 },
  blocks: { basic: 1.50, standard: 2.00, premium: 3.00 },
  wood: { basic: 3, standard: 5, premium: 8 },
  plywood: { basic: 25, standard: 35, premium: 55 },
  roofing: { basic: 12, standard: 18, premium: 30 },
  paint: { basic: 25, standard: 40, premium: 70 },
  tiles: { basic: 15, standard: 25, premium: 50 },
  wiring: { basic: 2, standard: 3, premium: 5 },
  pipes: { basic: 5, standard: 8, premium: 15 },
  insulation: { basic: 8, standard: 12, premium: 20 },
  drywall: { basic: 10, standard: 15, premium: 22 },
  windows: { basic: 150, standard: 250, premium: 450 },
  doors: { basic: 200, standard: 350, premium: 600 },
  // Advanced materials
  electricalPanel: { basic: 150, standard: 250, premium: 400 },
  breakers: { basic: 15, standard: 25, premium: 45 },
  outlets: { basic: 3, standard: 5, premium: 10 },
  switches: { basic: 2, standard: 4, premium: 8 },
  waterHeater: { basic: 300, standard: 500, premium: 900 },
  toilets: { basic: 150, standard: 300, premium: 600 },
  sinks: { basic: 80, standard: 150, premium: 350 },
  showerSet: { basic: 100, standard: 200, premium: 500 },
  valves: { basic: 8, standard: 15, premium: 30 },
  tileAdhesive: { basic: 12, standard: 18, premium: 28 },
  grout: { basic: 8, standard: 12, premium: 20 },
  plaster: { basic: 15, standard: 22, premium: 35 },
  formwork: { basic: 20, standard: 30, premium: 45 },
  waterproofing: { basic: 25, standard: 40, premium: 65 },
  labor: { basic: 15, standard: 25, premium: 40 }, // per hour estimate
}

// Waste buffer percentages based on project type
const wasteBufferPercentages: Record<ProjectType, number> = {
  house: 12,
  room: 10,
  wall: 8,
  roof: 15,
  extension: 12,
  foundation: 10,
  renovation: 15,
}

function generateProjectId(): string {
  return `BC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

function calculateWallArea(length: number, width: number, height: number): number {
  // Perimeter * height for walls
  return 2 * (length + width) * height
}

function calculateFloorArea(length: number, width: number): number {
  return length * width
}

function calculateRoofArea(length: number, width: number): number {
  // Adding 15% for roof pitch and overhang
  return length * width * 1.15
}

function calculateConcreteVolume(area: number, thickness: number): number {
  // Volume in cubic meters
  return area * thickness
}

export function calculateMaterials(input: ProjectInput): EstimateResult {
  const materials: MaterialItem[] = []
  const {
    projectType,
    length,
    width,
    height,
    qualityLevel,
    estimationMode = "simple",
    numberOfRooms,
    numberOfBathrooms,
    numberOfFloors,
    hasBasement,
    hasGarage,
    kitchenSize,
    structureType,
    wallType,
    roofType,
    hasElectricity,
    hasPlumbing,
    hasFinishing,
    floorCovering,
    roomType,
    electricalPoints,
    foundationType,
    foundationDepth,
    soilType,
    reinforcementRate,
    concreteClass,
    wallThickness,
    wallNeedsFooting,
    reinforcement,
    wallFinish,
    roofSlope,
    needsLoadBearing,
    needsInsulation,
    needsWaterproofing,
    connectsToExisting,
    needsStructuralReinforcement,
    matchExistingFinishes,
    needsDemolition,
    replaceElectrical,
    replacePlumbing,
    renovationLevel,
    zone,
  } = input

  const floorArea = calculateFloorArea(length, width)
  const perimeter = 2 * (length + width)
  const baseWallArea = calculateWallArea(length, width, height)
  const baseRoofArea = calculateRoofArea(length, width)

  const floorsCount = Math.max(1, numberOfFloors || 1)
  const roomsCount = Math.max(1, numberOfRooms || Math.ceil((floorArea * floorsCount) / 20))
  const bathroomsCount = Math.max(1, numberOfBathrooms || Math.ceil(roomsCount / 3))
  const advancedModeBoost = estimationMode === "advanced" ? 1.1 : 1
  const zoneMultiplier = zone === "urban" ? 1.08 : zone === "rural" ? 0.95 : 1

  const structureFactor =
    structureType === "wood"
      ? 0.8
      : structureType === "steel"
        ? 0.95
        : structureType === "mixed"
          ? 0.9
          : 1

  const wallFactor =
    wallType === "bricks"
      ? 0.95
      : wallType === "wood_frame"
        ? 0.62
        : wallType === "stone"
          ? 1.18
          : 1

  const roofFactor =
    roofType === "pitched"
      ? 1.18
      : roofType === "mansard"
        ? 1.3
        : 1

  const floorAreaTotal = floorArea * floorsCount
  const wallAreaGross = baseWallArea * floorsCount
  const openingRatio = Math.min(0.24, Math.max(0.1, 0.1 + roomsCount * 0.005 + bathroomsCount * 0.004))
  const wallAreaNet = wallAreaGross * (1 - openingRatio)
  const roofArea = baseRoofArea * roofFactor

  const addMaterial = (
    name: string,
    quantity: number,
    unit: string,
    unitPrice: number,
    category: string,
  ) => {
    const safeQuantity = Math.max(0, Math.round(quantity * 100) / 100)
    if (safeQuantity <= 0) return
    materials.push({
      name,
      quantity: safeQuantity,
      unit,
      unitPrice,
      totalPrice: Math.round(safeQuantity * unitPrice * 100) / 100,
      category,
    })
  }

  switch (projectType) {
    case "house": {
      const foundationTypeFactor =
        foundationType === "strip"
          ? 0.9
          : foundationType === "raft"
            ? 1.2
            : foundationType === "piles"
              ? 1.35
              : 1

      const complexityFactor =
        1 +
        (floorsCount - 1) * 0.12 +
        (hasBasement ? 0.1 : 0) +
        (hasGarage ? 0.05 : 0) +
        (kitchenSize === "large" ? 0.04 : kitchenSize === "medium" ? 0.02 : 0)

      const foundationThickness = 0.14 * foundationTypeFactor
      const foundationVolume = calculateConcreteVolume(floorArea, foundationThickness) * complexityFactor

      addMaterial("Cement (50kg bags)", foundationVolume * 7.1 * structureFactor, "bags", basePrices.cement[qualityLevel], "Foundation")
      addMaterial("Sand", foundationVolume * 0.52, "m³", basePrices.sand[qualityLevel], "Foundation")
      addMaterial("Gravel/Aggregate", foundationVolume * 0.95, "m³", basePrices.gravel[qualityLevel], "Foundation")
      addMaterial(
        "Steel Reinforcement",
        floorAreaTotal * (0.025 + (floorsCount - 1) * 0.004) * structureFactor,
        "tons",
        basePrices.steel[qualityLevel],
        "Structure",
      )

      if (wallType === "wood_frame") {
        addMaterial("Timber (structure)", wallAreaNet * 18, "linear m", basePrices.wood[qualityLevel], "Walls")
        addMaterial("Drywall Sheets", wallAreaNet / 2.8, "sheets", basePrices.drywall[qualityLevel], "Walls")
      } else {
        addMaterial("Concrete Blocks", wallAreaNet * 12.2 * wallFactor, "pieces", basePrices.blocks[qualityLevel], "Walls")
        addMaterial("Cement for Mortar (50kg bags)", wallAreaNet * 0.23 * wallFactor, "bags", basePrices.cement[qualityLevel], "Walls")
      }
      addMaterial("Sand for Mortar", wallAreaNet * 0.022 * wallFactor, "m³", basePrices.sand[qualityLevel], "Walls")

      addMaterial("Roofing Sheets", roofArea / 2.4, "sheets", basePrices.roofing[qualityLevel], "Roofing")
      addMaterial("Timber (roof structure)", roofArea * 5.8, "linear m", basePrices.wood[qualityLevel], "Roofing")

      if (estimationMode === "advanced") {
        addMaterial("Formwork (rental/materials)", (perimeter * 0.3 + floorArea * 0.15) * complexityFactor, "m²", basePrices.formwork[qualityLevel], "Foundation")
        addMaterial("Waterproofing Membrane", floorAreaTotal * 1.08, "m²", basePrices.waterproofing[qualityLevel], "Foundation")
      }

      if (hasElectricity !== false) {
        const wireBase = floorAreaTotal * (estimationMode === "advanced" ? 5.8 : 4.4)
        const electricalPointsCount = Math.max(roomsCount * 4 + bathroomsCount * 2 + floorsCount * 2, electricalPoints || 0)
        addMaterial("Electrical Wiring", wireBase + electricalPointsCount * 2.2, "meters", basePrices.wiring[qualityLevel], "Electrical")

        if (estimationMode === "advanced") {
          addMaterial("Electrical Panel", Math.max(1, Math.ceil(floorsCount / 2)), "unit", basePrices.electricalPanel[qualityLevel], "Electrical")
          addMaterial("Circuit Breakers", electricalPointsCount * 0.28, "units", basePrices.breakers[qualityLevel], "Electrical")
          addMaterial("Power Outlets", electricalPointsCount * 0.7, "units", basePrices.outlets[qualityLevel], "Electrical")
          addMaterial("Light Switches", electricalPointsCount * 0.45, "units", basePrices.switches[qualityLevel], "Electrical")
        }
      }

      if (hasPlumbing !== false) {
        const pipesLength = floorAreaTotal * (estimationMode === "advanced" ? 2.2 : 1.6) + bathroomsCount * 7
        addMaterial("Plumbing Pipes", pipesLength, "meters", basePrices.pipes[qualityLevel], "Plumbing")

        if (estimationMode === "advanced") {
          addMaterial("Water Heater", Math.max(1, Math.ceil(bathroomsCount / 2)), "units", basePrices.waterHeater[qualityLevel], "Plumbing")
          addMaterial("Toilets", bathroomsCount, "units", basePrices.toilets[qualityLevel], "Plumbing")
          addMaterial("Sinks", bathroomsCount + 1, "units", basePrices.sinks[qualityLevel], "Plumbing")
          addMaterial("Shower Set", bathroomsCount, "units", basePrices.showerSet[qualityLevel], "Plumbing")
          addMaterial("Valves & Fittings", pipesLength / 10, "units", basePrices.valves[qualityLevel], "Plumbing")
        }
      }

      if (hasFinishing !== false || estimationMode === "simple") {
        const floorFinishMultiplier = floorCovering === "wood" ? 1.12 : floorCovering === "laminate" ? 1.04 : 1
        addMaterial("Paint", (wallAreaGross * 1.8 + floorAreaTotal * 0.35) * 0.145, "liters", basePrices.paint[qualityLevel], "Finishing")
        addMaterial("Floor Tiles", floorAreaTotal * 1.06 * floorFinishMultiplier, "m²", basePrices.tiles[qualityLevel], "Finishing")

        if (estimationMode === "advanced") {
          const bathroomWallTiles = bathroomsCount * 19
          addMaterial("Bathroom Wall Tiles", bathroomWallTiles, "m²", basePrices.tiles[qualityLevel], "Finishing")
          addMaterial("Tile Adhesive", (floorAreaTotal + bathroomWallTiles) * 0.05, "bags", basePrices.tileAdhesive[qualityLevel], "Finishing")
          addMaterial("Grout", (floorAreaTotal + bathroomWallTiles) * 0.02, "bags", basePrices.grout[qualityLevel], "Finishing")
          addMaterial("Ceiling Plaster", floorAreaTotal * 1.03, "m²", basePrices.plaster[qualityLevel], "Finishing")
        }
      }

      addMaterial("Windows", wallAreaGross / 16 + floorsCount * 1.5, "units", basePrices.windows[qualityLevel], "Openings")
      addMaterial("Doors", roomsCount + bathroomsCount + floorsCount, "units", basePrices.doors[qualityLevel], "Openings")
      break
    }

    case "extension":
    case "room": {
      const isExtension = projectType === "extension"
      const extensionFactor = isExtension ? 1.15 : 1
      const connectionFactor = connectsToExisting ? 1.05 : 1
      const reinforcementFactor = needsStructuralReinforcement ? 1.12 : 1
      const matchFinishesFactor = matchExistingFinishes ? 1.1 : 1
      const roomUsageFactor =
        roomType === "kitchen"
          ? 1.12
          : roomType === "bathroom"
            ? 1.18
            : roomType === "living_room"
              ? 1.05
              : 1

      const shellFactor = extensionFactor * connectionFactor * reinforcementFactor * roomUsageFactor

      addMaterial("Concrete Blocks", wallAreaNet * 12 * wallFactor * shellFactor, "pieces", basePrices.blocks[qualityLevel], "Walls")
      addMaterial("Cement (50kg bags)", wallAreaNet * 0.28 * shellFactor, "bags", basePrices.cement[qualityLevel], "Walls")
      addMaterial("Sand", wallAreaNet * 0.024 * shellFactor, "m³", basePrices.sand[qualityLevel], "Walls")

      const coveringFactor =
        floorCovering === "wood"
          ? 1.14
          : floorCovering === "laminate"
            ? 1.07
            : floorCovering === "vinyl"
              ? 0.95
              : floorCovering === "carpet"
                ? 0.9
                : 1

      addMaterial("Floor Tiles", floorArea * 1.05 * coveringFactor * matchFinishesFactor, "m²", basePrices.tiles[qualityLevel], "Finishing")
      addMaterial("Paint", wallAreaGross * 0.16 * matchFinishesFactor, "liters", basePrices.paint[qualityLevel], "Finishing")

      const points = Math.max(4, electricalPoints || Math.ceil(floorArea / 4))
      addMaterial("Electrical Wiring", floorArea * 3.5 + points * 1.8, "meters", basePrices.wiring[qualityLevel], "Electrical")
      if (estimationMode === "advanced") {
        addMaterial("Power Outlets", Math.ceil(points * 0.65), "units", basePrices.outlets[qualityLevel], "Electrical")
        addMaterial("Light Switches", Math.ceil(points * 0.45), "units", basePrices.switches[qualityLevel], "Electrical")
      }

      if (roomType === "kitchen" || roomType === "bathroom" || estimationMode === "advanced") {
        addMaterial("Plumbing Pipes", floorArea * (roomType === "bathroom" ? 2.4 : 1.5), "meters", basePrices.pipes[qualityLevel], "Plumbing")
      }

      addMaterial("Door", 1, "unit", basePrices.doors[qualityLevel], "Openings")
      addMaterial("Windows", Math.max(1, wallAreaGross / 20), "units", basePrices.windows[qualityLevel], "Openings")
      break
    }

    case "wall": {
      const thicknessM = (wallThickness || 20) / 100
      const reinforcementFactor = reinforcement === "reinforced" ? 1.25 : 1
      const finishFactor = wallFinish === "painted" ? 1.2 : wallFinish === "plastered" ? 1.1 : 1
      const footingFactor = wallNeedsFooting ? 1.18 : 1
      const wallComplexity = thicknessM / 0.2

      addMaterial("Concrete Blocks", wallAreaGross * 12.4 * wallComplexity * footingFactor, "pieces", basePrices.blocks[qualityLevel], "Walls")
      addMaterial("Cement (50kg bags)", wallAreaGross * 0.29 * wallComplexity * footingFactor, "bags", basePrices.cement[qualityLevel], "Walls")
      addMaterial("Sand", wallAreaGross * 0.024 * wallComplexity * footingFactor, "m³", basePrices.sand[qualityLevel], "Walls")
      addMaterial("Steel Reinforcement", wallAreaGross * 0.0075 * reinforcementFactor, "tons", basePrices.steel[qualityLevel], "Structure")

      if (wallFinish !== "raw") {
        addMaterial("Paint", wallAreaGross * 0.11 * finishFactor, "liters", basePrices.paint[qualityLevel], "Finishing")
        addMaterial("Plaster", wallAreaGross * 1.02, "m²", basePrices.plaster[qualityLevel], "Finishing")
      }
      break
    }

    case "roof": {
      const slopeFactor = roofSlope ? 1 + Math.max(0, roofSlope - 10) / 120 : 1.1
      const roofNeedsFactor = (needsLoadBearing ? 1.1 : 1) * (needsInsulation ? 1.08 : 1) * (needsWaterproofing ? 1.1 : 1)
      const totalRoofArea = roofArea * slopeFactor

      addMaterial("Roofing Sheets", totalRoofArea / 2.35, "sheets", basePrices.roofing[qualityLevel], "Roofing")
      addMaterial("Timber (structure)", totalRoofArea * 6.2 * roofNeedsFactor, "linear m", basePrices.wood[qualityLevel], "Roofing")
      addMaterial("Plywood Sheets", totalRoofArea / 2.75, "sheets", basePrices.plywood[qualityLevel], "Roofing")
      if (needsInsulation !== false) {
        addMaterial("Insulation", totalRoofArea * 1.04, "m²", basePrices.insulation[qualityLevel], "Roofing")
      }
      if (needsWaterproofing || estimationMode === "advanced") {
        addMaterial("Waterproofing Membrane", totalRoofArea * 1.06, "m²", basePrices.waterproofing[qualityLevel], "Roofing")
      }
      break
    }

    case "foundation": {
      const depth = Math.max(0.35, foundationDepth || 0.6)
      const soilFactor = soilType === "clay" ? 1.15 : soilType === "sand" ? 1.08 : soilType === "rock" ? 0.9 : 1
      const classFactor = concreteClass === "C30" ? 1.1 : concreteClass === "C25" ? 1.05 : 1
      const rebarRate = Math.max(65, reinforcementRate || 85)

      const foundationVolume = floorArea * depth * 0.55 * soilFactor

      addMaterial("Cement (50kg bags)", foundationVolume * 7.2 * classFactor, "bags", basePrices.cement[qualityLevel], "Foundation")
      addMaterial("Sand", foundationVolume * 0.5, "m³", basePrices.sand[qualityLevel], "Foundation")
      addMaterial("Gravel/Aggregate", foundationVolume * 0.94, "m³", basePrices.gravel[qualityLevel], "Foundation")
      addMaterial("Steel Reinforcement", (foundationVolume * rebarRate) / 1000, "tons", basePrices.steel[qualityLevel], "Foundation")

      if (estimationMode === "advanced") {
        addMaterial("Formwork (rental/materials)", perimeter * depth * 2.1, "m²", basePrices.formwork[qualityLevel], "Foundation")
      }
      break
    }

    case "renovation": {
      const levelFactor = renovationLevel === "complete" ? 1.35 : renovationLevel === "medium" ? 1.15 : 1
      const demolitionFactor = needsDemolition ? 1.12 : 1
      const scopeFactor = levelFactor * demolitionFactor

      addMaterial("Drywall Sheets", (wallAreaGross / 3) * scopeFactor, "sheets", basePrices.drywall[qualityLevel], "Walls")
      addMaterial("Paint", wallAreaGross * 0.17 * scopeFactor, "liters", basePrices.paint[qualityLevel], "Finishing")
      addMaterial("Floor Tiles", floorAreaTotal * 1.08 * scopeFactor, "m²", basePrices.tiles[qualityLevel], "Finishing")

      if (replaceElectrical || estimationMode === "advanced") {
        addMaterial("Electrical Wiring", floorAreaTotal * 4.1 * scopeFactor, "meters", basePrices.wiring[qualityLevel], "Electrical")
      }
      if (replacePlumbing || estimationMode === "advanced") {
        addMaterial("Plumbing Pipes", floorAreaTotal * 1.25 * scopeFactor, "meters", basePrices.pipes[qualityLevel], "Plumbing")
      }
      if (estimationMode === "advanced") {
        addMaterial("Tile Adhesive", floorAreaTotal * 0.05 * scopeFactor, "bags", basePrices.tileAdhesive[qualityLevel], "Finishing")
        addMaterial("Grout", floorAreaTotal * 0.02 * scopeFactor, "bags", basePrices.grout[qualityLevel], "Finishing")
      }
      break
    }
  }

  // Apply global complexity and location adjustments to quantities
  const complexityAdjust = advancedModeBoost * zoneMultiplier
  for (const item of materials) {
    item.quantity = Math.round(item.quantity * complexityAdjust * 100) / 100
    item.totalPrice = Math.round(item.quantity * item.unitPrice * 100) / 100
  }

  // Calculate totals
  const subtotal = materials.reduce((sum, item) => sum + item.totalPrice, 0)
  const wasteBufferPercentage = wasteBufferPercentages[projectType]
  const wasteBuffer = subtotal * (wasteBufferPercentage / 100)
  const total = subtotal + wasteBuffer

  return {
    materials,
    subtotal: Math.round(subtotal * 100) / 100,
    wasteBuffer: Math.round(wasteBuffer * 100) / 100,
    wasteBufferPercentage,
    total: Math.round(total * 100) / 100,
    projectDetails: input,
    generatedAt: new Date(),
    projectId: generateProjectId(),
  }
}

export function getProjectTypeLabel(type: ProjectType): string {
  const labels: Record<ProjectType, string> = {
    house: "Full House",
    room: "Single Room",
    wall: "Wall Construction",
    roof: "Roof/Roofing",
    extension: "Extension",
    foundation: "Foundation",
    renovation: "Renovation",
  }
  return labels[type]
}

export function getQualityLabel(level: QualityLevel): string {
  const labels: Record<QualityLevel, string> = {
    basic: "Basic (Economy)",
    standard: "Standard (Recommended)",
    premium: "Premium (High-End)",
  }
  return labels[level]
}
