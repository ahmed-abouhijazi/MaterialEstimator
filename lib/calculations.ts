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

export interface ProjectInput {
  projectType: ProjectType
  length: number // in meters
  width: number // in meters
  height: number // in meters
  location: string
  qualityLevel: QualityLevel
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
  const { projectType, length, width, height, qualityLevel } = input

  const floorArea = calculateFloorArea(length, width)
  const wallArea = calculateWallArea(length, width, height)
  const roofArea = calculateRoofArea(length, width)

  // Calculate materials based on project type
  switch (projectType) {
    case "house":
      // Foundation (slab 0.15m thick)
      const foundationVolume = calculateConcreteVolume(floorArea, 0.15)
      const cementBagsFoundation = Math.ceil(foundationVolume * 6.5) // ~6.5 bags per m³
      materials.push({
        name: "Cement (50kg bags)",
        quantity: cementBagsFoundation,
        unit: "bags",
        unitPrice: basePrices.cement[qualityLevel],
        totalPrice: cementBagsFoundation * basePrices.cement[qualityLevel],
        category: "Foundation",
      })

      // Sand for foundation
      const sandFoundation = Math.ceil(foundationVolume * 0.45) // m³
      materials.push({
        name: "Sand",
        quantity: sandFoundation,
        unit: "m³",
        unitPrice: basePrices.sand[qualityLevel],
        totalPrice: sandFoundation * basePrices.sand[qualityLevel],
        category: "Foundation",
      })

      // Gravel/Aggregate
      const gravel = Math.ceil(foundationVolume * 0.9) // m³
      materials.push({
        name: "Gravel/Aggregate",
        quantity: gravel,
        unit: "m³",
        unitPrice: basePrices.gravel[qualityLevel],
        totalPrice: gravel * basePrices.gravel[qualityLevel],
        category: "Foundation",
      })

      // Steel reinforcement
      const steel = Math.ceil(floorArea * 0.035) // tons (~35kg per m²)
      materials.push({
        name: "Steel Reinforcement",
        quantity: steel,
        unit: "tons",
        unitPrice: basePrices.steel[qualityLevel],
        totalPrice: steel * basePrices.steel[qualityLevel],
        category: "Structure",
      })

      // Blocks/Bricks for walls
      const blocks = Math.ceil(wallArea * 12.5) // ~12.5 blocks per m²
      materials.push({
        name: "Concrete Blocks",
        quantity: blocks,
        unit: "pieces",
        unitPrice: basePrices.blocks[qualityLevel],
        totalPrice: blocks * basePrices.blocks[qualityLevel],
        category: "Walls",
      })

      // Cement for walls (mortar)
      const cementWalls = Math.ceil(wallArea * 0.25) // bags
      materials.push({
        name: "Cement for Mortar (50kg bags)",
        quantity: cementWalls,
        unit: "bags",
        unitPrice: basePrices.cement[qualityLevel],
        totalPrice: cementWalls * basePrices.cement[qualityLevel],
        category: "Walls",
      })

      // Sand for mortar
      const sandMortar = Math.ceil(wallArea * 0.02) // m³
      materials.push({
        name: "Sand for Mortar",
        quantity: sandMortar,
        unit: "m³",
        unitPrice: basePrices.sand[qualityLevel],
        totalPrice: sandMortar * basePrices.sand[qualityLevel],
        category: "Walls",
      })

      // Roofing
      const roofingSheets = Math.ceil(roofArea / 2.5) // sheets (~2.5m² per sheet)
      materials.push({
        name: "Roofing Sheets",
        quantity: roofingSheets,
        unit: "sheets",
        unitPrice: basePrices.roofing[qualityLevel],
        totalPrice: roofingSheets * basePrices.roofing[qualityLevel],
        category: "Roofing",
      })

      // Wood for roof structure
      const woodRoof = Math.ceil(roofArea * 0.015 * 1000) // linear meters
      materials.push({
        name: "Timber (roof structure)",
        quantity: woodRoof,
        unit: "linear m",
        unitPrice: basePrices.wood[qualityLevel],
        totalPrice: woodRoof * basePrices.wood[qualityLevel],
        category: "Roofing",
      })

      // Electrical wiring
      const wiring = Math.ceil(floorArea * 5) // meters of wire
      materials.push({
        name: "Electrical Wiring",
        quantity: wiring,
        unit: "meters",
        unitPrice: basePrices.wiring[qualityLevel],
        totalPrice: wiring * basePrices.wiring[qualityLevel],
        category: "Electrical",
      })

      // Plumbing pipes
      const pipes = Math.ceil(floorArea * 1.5) // meters
      materials.push({
        name: "Plumbing Pipes",
        quantity: pipes,
        unit: "meters",
        unitPrice: basePrices.pipes[qualityLevel],
        totalPrice: pipes * basePrices.pipes[qualityLevel],
        category: "Plumbing",
      })

      // Paint (interior + exterior)
      const paintLiters = Math.ceil((wallArea * 2 + floorArea) * 0.15) // liters
      materials.push({
        name: "Paint",
        quantity: paintLiters,
        unit: "liters",
        unitPrice: basePrices.paint[qualityLevel],
        totalPrice: paintLiters * basePrices.paint[qualityLevel],
        category: "Finishing",
      })

      // Floor tiles
      const tiles = Math.ceil(floorArea * 1.05) // m² with 5% extra
      materials.push({
        name: "Floor Tiles",
        quantity: tiles,
        unit: "m²",
        unitPrice: basePrices.tiles[qualityLevel],
        totalPrice: tiles * basePrices.tiles[qualityLevel],
        category: "Finishing",
      })

      // Windows (estimate based on wall area)
      const windowCount = Math.ceil(wallArea / 15) // 1 window per 15m² wall
      materials.push({
        name: "Windows",
        quantity: windowCount,
        unit: "units",
        unitPrice: basePrices.windows[qualityLevel],
        totalPrice: windowCount * basePrices.windows[qualityLevel],
        category: "Openings",
      })

      // Doors
      const doorCount = Math.ceil(floorArea / 20) + 1 // 1 door per 20m² + main door
      materials.push({
        name: "Doors",
        quantity: doorCount,
        unit: "units",
        unitPrice: basePrices.doors[qualityLevel],
        totalPrice: doorCount * basePrices.doors[qualityLevel],
        category: "Openings",
      })
      break

    case "room":
    case "extension":
      // Walls
      const roomBlocks = Math.ceil(wallArea * 12.5)
      materials.push({
        name: "Concrete Blocks",
        quantity: roomBlocks,
        unit: "pieces",
        unitPrice: basePrices.blocks[qualityLevel],
        totalPrice: roomBlocks * basePrices.blocks[qualityLevel],
        category: "Walls",
      })

      const roomCement = Math.ceil(wallArea * 0.3)
      materials.push({
        name: "Cement (50kg bags)",
        quantity: roomCement,
        unit: "bags",
        unitPrice: basePrices.cement[qualityLevel],
        totalPrice: roomCement * basePrices.cement[qualityLevel],
        category: "Walls",
      })

      const roomSand = Math.ceil(wallArea * 0.025)
      materials.push({
        name: "Sand",
        quantity: roomSand,
        unit: "m³",
        unitPrice: basePrices.sand[qualityLevel],
        totalPrice: roomSand * basePrices.sand[qualityLevel],
        category: "Walls",
      })

      // Floor
      const roomTiles = Math.ceil(floorArea * 1.05)
      materials.push({
        name: "Floor Tiles",
        quantity: roomTiles,
        unit: "m²",
        unitPrice: basePrices.tiles[qualityLevel],
        totalPrice: roomTiles * basePrices.tiles[qualityLevel],
        category: "Finishing",
      })

      const roomPaint = Math.ceil(wallArea * 0.15)
      materials.push({
        name: "Paint",
        quantity: roomPaint,
        unit: "liters",
        unitPrice: basePrices.paint[qualityLevel],
        totalPrice: roomPaint * basePrices.paint[qualityLevel],
        category: "Finishing",
      })

      // Electrical
      const roomWiring = Math.ceil(floorArea * 3)
      materials.push({
        name: "Electrical Wiring",
        quantity: roomWiring,
        unit: "meters",
        unitPrice: basePrices.wiring[qualityLevel],
        totalPrice: roomWiring * basePrices.wiring[qualityLevel],
        category: "Electrical",
      })

      // Door and window
      materials.push({
        name: "Door",
        quantity: 1,
        unit: "unit",
        unitPrice: basePrices.doors[qualityLevel],
        totalPrice: basePrices.doors[qualityLevel],
        category: "Openings",
      })

      const roomWindows = Math.ceil(wallArea / 20)
      materials.push({
        name: "Windows",
        quantity: Math.max(1, roomWindows),
        unit: "units",
        unitPrice: basePrices.windows[qualityLevel],
        totalPrice: Math.max(1, roomWindows) * basePrices.windows[qualityLevel],
        category: "Openings",
      })
      break

    case "wall":
      const wallBlocks = Math.ceil(wallArea * 12.5)
      materials.push({
        name: "Concrete Blocks",
        quantity: wallBlocks,
        unit: "pieces",
        unitPrice: basePrices.blocks[qualityLevel],
        totalPrice: wallBlocks * basePrices.blocks[qualityLevel],
        category: "Walls",
      })

      const wallCement = Math.ceil(wallArea * 0.3)
      materials.push({
        name: "Cement (50kg bags)",
        quantity: wallCement,
        unit: "bags",
        unitPrice: basePrices.cement[qualityLevel],
        totalPrice: wallCement * basePrices.cement[qualityLevel],
        category: "Walls",
      })

      const wallSand = Math.ceil(wallArea * 0.025)
      materials.push({
        name: "Sand",
        quantity: wallSand,
        unit: "m³",
        unitPrice: basePrices.sand[qualityLevel],
        totalPrice: wallSand * basePrices.sand[qualityLevel],
        category: "Walls",
      })

      const wallSteel = Math.ceil(wallArea * 0.008)
      if (wallSteel > 0) {
        materials.push({
          name: "Steel Reinforcement",
          quantity: Math.max(0.1, wallSteel),
          unit: "tons",
          unitPrice: basePrices.steel[qualityLevel],
          totalPrice: Math.max(0.1, wallSteel) * basePrices.steel[qualityLevel],
          category: "Structure",
        })
      }
      break

    case "roof":
      const roofSheets = Math.ceil(roofArea / 2.5)
      materials.push({
        name: "Roofing Sheets",
        quantity: roofSheets,
        unit: "sheets",
        unitPrice: basePrices.roofing[qualityLevel],
        totalPrice: roofSheets * basePrices.roofing[qualityLevel],
        category: "Roofing",
      })

      const roofTimber = Math.ceil(roofArea * 0.02 * 1000)
      materials.push({
        name: "Timber (structure)",
        quantity: roofTimber,
        unit: "linear m",
        unitPrice: basePrices.wood[qualityLevel],
        totalPrice: roofTimber * basePrices.wood[qualityLevel],
        category: "Roofing",
      })

      const roofPlywood = Math.ceil(roofArea / 2.88)
      materials.push({
        name: "Plywood Sheets",
        quantity: roofPlywood,
        unit: "sheets",
        unitPrice: basePrices.plywood[qualityLevel],
        totalPrice: roofPlywood * basePrices.plywood[qualityLevel],
        category: "Roofing",
      })

      const roofInsulation = Math.ceil(roofArea * 1.05)
      materials.push({
        name: "Insulation",
        quantity: roofInsulation,
        unit: "m²",
        unitPrice: basePrices.insulation[qualityLevel],
        totalPrice: roofInsulation * basePrices.insulation[qualityLevel],
        category: "Roofing",
      })
      break

    case "foundation":
      const foundVolume = calculateConcreteVolume(floorArea, 0.2)
      const foundCement = Math.ceil(foundVolume * 7)
      materials.push({
        name: "Cement (50kg bags)",
        quantity: foundCement,
        unit: "bags",
        unitPrice: basePrices.cement[qualityLevel],
        totalPrice: foundCement * basePrices.cement[qualityLevel],
        category: "Foundation",
      })

      const foundSand = Math.ceil(foundVolume * 0.5)
      materials.push({
        name: "Sand",
        quantity: foundSand,
        unit: "m³",
        unitPrice: basePrices.sand[qualityLevel],
        totalPrice: foundSand * basePrices.sand[qualityLevel],
        category: "Foundation",
      })

      const foundGravel = Math.ceil(foundVolume * 0.95)
      materials.push({
        name: "Gravel/Aggregate",
        quantity: foundGravel,
        unit: "m³",
        unitPrice: basePrices.gravel[qualityLevel],
        totalPrice: foundGravel * basePrices.gravel[qualityLevel],
        category: "Foundation",
      })

      const foundSteel = Math.ceil(floorArea * 0.04)
      materials.push({
        name: "Steel Reinforcement",
        quantity: foundSteel,
        unit: "tons",
        unitPrice: basePrices.steel[qualityLevel],
        totalPrice: foundSteel * basePrices.steel[qualityLevel],
        category: "Foundation",
      })
      break

    case "renovation":
      // Drywall
      const drywall = Math.ceil(wallArea / 3)
      materials.push({
        name: "Drywall Sheets",
        quantity: drywall,
        unit: "sheets",
        unitPrice: basePrices.drywall[qualityLevel],
        totalPrice: drywall * basePrices.drywall[qualityLevel],
        category: "Walls",
      })

      const renoPaint = Math.ceil(wallArea * 0.18)
      materials.push({
        name: "Paint",
        quantity: renoPaint,
        unit: "liters",
        unitPrice: basePrices.paint[qualityLevel],
        totalPrice: renoPaint * basePrices.paint[qualityLevel],
        category: "Finishing",
      })

      const renoTiles = Math.ceil(floorArea * 1.1)
      materials.push({
        name: "Floor Tiles",
        quantity: renoTiles,
        unit: "m²",
        unitPrice: basePrices.tiles[qualityLevel],
        totalPrice: renoTiles * basePrices.tiles[qualityLevel],
        category: "Finishing",
      })

      const renoWiring = Math.ceil(floorArea * 4)
      materials.push({
        name: "Electrical Wiring",
        quantity: renoWiring,
        unit: "meters",
        unitPrice: basePrices.wiring[qualityLevel],
        totalPrice: renoWiring * basePrices.wiring[qualityLevel],
        category: "Electrical",
      })

      const renoPipes = Math.ceil(floorArea * 1.2)
      materials.push({
        name: "Plumbing Pipes",
        quantity: renoPipes,
        unit: "meters",
        unitPrice: basePrices.pipes[qualityLevel],
        totalPrice: renoPipes * basePrices.pipes[qualityLevel],
        category: "Plumbing",
      })
      break
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
