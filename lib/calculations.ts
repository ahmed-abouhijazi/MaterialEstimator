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
  const { projectType, length, width, height, qualityLevel, estimationMode = 'simple', numberOfRooms, numberOfBathrooms, numberOfFloors, hasBasement, hasGarage, kitchenSize } = input

  const floorArea = calculateFloorArea(length, width)
  const wallArea = calculateWallArea(length, width, height)
  const roofArea = calculateRoofArea(length, width)
  
  // Use advanced inputs or defaults
  const bathroomsCount = numberOfBathrooms || Math.max(1, Math.floor(floorArea / 50))
  const roomsCount = numberOfRooms || Math.max(2, Math.floor(floorArea / 15))
  const floorsCount = numberOfFloors || 1

  // Calculate materials based on project type
  switch (projectType) {
    case "house":
      // Foundation (slab 0.15m thick) - FIXED: More realistic cement calculation
      const foundationVolume = calculateConcreteVolume(floorArea, 0.15)
      const cementBagsFoundation = Math.ceil(foundationVolume * 6.5) // ~6.5 bags per m³
      
      // FIXED: Add cement for columns and footings (review mentioned 130-160 bags)
      const additionalStructuralCement = Math.ceil(floorArea * 0.8) // Extra for columns/footings
      const totalCementBags = cementBagsFoundation + additionalStructuralCement
      
      materials.push({
        name: "Cement (50kg bags)",
        quantity: totalCementBags,
        unit: "bags",
        unitPrice: basePrices.cement[qualityLevel],
        totalPrice: totalCementBags * basePrices.cement[qualityLevel],
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

      // Steel reinforcement - FIXED: Reduced from 35kg to 25-30kg per m² (review: 2.5-3.5 tons for 100m²)
      const steel = Math.ceil(floorArea * 0.028 * 10) / 10 // ~28kg per m² = 2.8 tons for 100m²
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

      // Wood for roof structure - FIXED: Reduced from 0.015 to realistic 0.005-0.007 (review: 400-700lm for 100m²)
      const woodRoof = Math.ceil(roofArea * 0.006 * 1000) // linear meters (~600lm for 100m²)
      materials.push({
        name: "Timber (roof structure)",
        quantity: woodRoof,
        unit: "linear m",
        unitPrice: basePrices.wood[qualityLevel],
        totalPrice: woodRoof * basePrices.wood[qualityLevel],
        category: "Roofing",
      })

      // Advanced mode additions
      if (estimationMode === 'advanced') {
        // Formwork for foundation
        const formworkArea = Math.ceil((2 * (length + width) * 0.15) + (floorArea * 0.1)) // perimeter + some horizontal
        materials.push({
          name: "Formwork (rental/materials)",
          quantity: formworkArea,
          unit: "m²",
          unitPrice: basePrices.formwork[qualityLevel],
          totalPrice: formworkArea * basePrices.formwork[qualityLevel],
          category: "Foundation",
        })

        // Waterproofing
        materials.push({
          name: "Waterproofing Membrane",
          quantity: Math.ceil(floorArea * 1.1),
          unit: "m²",
          unitPrice: basePrices.waterproofing[qualityLevel],
          totalPrice: Math.ceil(floorArea * 1.1) * basePrices.waterproofing[qualityLevel],
          category: "Foundation",
        })
      }

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

      // Advanced electrical components
      if (estimationMode === 'advanced') {
        materials.push({
          name: "Electrical Panel",
          quantity: 1,
          unit: "unit",
          unitPrice: basePrices.electricalPanel[qualityLevel],
          totalPrice: basePrices.electricalPanel[qualityLevel],
          category: "Electrical",
        })

        const breakersCount = Math.ceil(floorArea / 20) // ~1 breaker per 20m²
        materials.push({
          name: "Circuit Breakers",
          quantity: breakersCount,
          unit: "units",
          unitPrice: basePrices.breakers[qualityLevel],
          totalPrice: breakersCount * basePrices.breakers[qualityLevel],
          category: "Electrical",
        })

        const outletsCount = Math.ceil(floorArea / 10) // ~1 outlet per 10m²
        materials.push({
          name: "Power Outlets",
          quantity: outletsCount,
          unit: "units",
          unitPrice: basePrices.outlets[qualityLevel],
          totalPrice: outletsCount * basePrices.outlets[qualityLevel],
          category: "Electrical",
        })

        const switchesCount = roomsCount + bathroomsCount + 2 // switches for rooms + bathrooms + common areas
        materials.push({
          name: "Light Switches",
          quantity: switchesCount,
          unit: "units",
          unitPrice: basePrices.switches[qualityLevel],
          totalPrice: switchesCount * basePrices.switches[qualityLevel],
          category: "Electrical",
        })
      }

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

      // Advanced plumbing components
      if (estimationMode === 'advanced') {
        materials.push({
          name: "Water Heater",
          quantity: bathroomsCount,
          unit: "units",
          unitPrice: basePrices.waterHeater[qualityLevel],
          totalPrice: bathroomsCount * basePrices.waterHeater[qualityLevel],
          category: "Plumbing",
        })

        materials.push({
          name: "Toilets",
          quantity: bathroomsCount,
          unit: "units",
          unitPrice: basePrices.toilets[qualityLevel],
          totalPrice: bathroomsCount * basePrices.toilets[qualityLevel],
          category: "Plumbing",
        })

        materials.push({
          name: "Sinks",
          quantity: bathroomsCount + 1, // bathroom + kitchen
          unit: "units",
          unitPrice: basePrices.sinks[qualityLevel],
          totalPrice: (bathroomsCount + 1) * basePrices.sinks[qualityLevel],
          category: "Plumbing",
        })

        materials.push({
          name: "Shower Set",
          quantity: bathroomsCount,
          unit: "units",
          unitPrice: basePrices.showerSet[qualityLevel],
          totalPrice: bathroomsCount * basePrices.showerSet[qualityLevel],
          category: "Plumbing",
        })

        materials.push({
          name: "Valves & Fittings",
          quantity: Math.ceil(pipes / 10), // ~1 valve per 10m of pipe
          unit: "units",
          unitPrice: basePrices.valves[qualityLevel],
          totalPrice: Math.ceil(pipes / 10) * basePrices.valves[qualityLevel],
          category: "Plumbing",
        })
      }

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

      // Advanced finishing
      if (estimationMode === 'advanced') {
        const bathroomWallTiles = Math.ceil(bathroomsCount * 20) // ~20m² per bathroom

        materials.push({
          name: "Bathroom Wall Tiles",
          quantity: bathroomWallTiles,
          unit: "m²",
          unitPrice: basePrices.tiles[qualityLevel],
          totalPrice: bathroomWallTiles * basePrices.tiles[qualityLevel],
          category: "Finishing",
        })

        materials.push({
          name: "Tile Adhesive",
          quantity: Math.ceil((tiles + bathroomWallTiles) * 0.05), // ~5kg per m²
          unit: "bags",
          unitPrice: basePrices.tileAdhesive[qualityLevel],
          totalPrice: Math.ceil((tiles + bathroomWallTiles) * 0.05) * basePrices.tileAdhesive[qualityLevel],
          category: "Finishing",
        })

        materials.push({
          name: "Grout",
          quantity: Math.ceil((tiles + bathroomWallTiles) * 0.02), // ~2kg per m²
          unit: "bags",
          unitPrice: basePrices.grout[qualityLevel],
          totalPrice: Math.ceil((tiles + bathroomWallTiles) * 0.02) * basePrices.grout[qualityLevel],
          category: "Finishing",
        })

        materials.push({
          name: "Ceiling Plaster",
          quantity: Math.ceil(floorArea * 1.05),
          unit: "m²",
          unitPrice: basePrices.plaster[qualityLevel],
          totalPrice: Math.ceil(floorArea * 1.05) * basePrices.plaster[qualityLevel],
          category: "Finishing",
        })
      }

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
      const doorCount = roomsCount + 1 // doors for each room + main door
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
