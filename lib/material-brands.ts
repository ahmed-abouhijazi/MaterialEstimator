import type { QualityLevel } from './calculations'

export interface MaterialBrand {
  name: string
  category: string
  quality: QualityLevel
  regions: string[]
  priceMultiplier: number // Relative to base price
  description: string
  availability: 'excellent' | 'good' | 'limited'
}

// Comprehensive material brands database by region and quality
export const materialBrands: MaterialBrand[] = [
  // Cement Brands
  {
    name: "Lafarge",
    category: "Cement",
    quality: "premium",
    regions: ["France", "Morocco", "United Kingdom", "Canada"],
    priceMultiplier: 1.3,
    description: "Premium French cement, excellent for all applications",
    availability: "excellent"
  },
  {
    name: "Holcim",
    category: "Cement",
    quality: "standard",
    regions: ["Morocco", "France", "United States - Northeast"],
    priceMultiplier: 1.0,
    description: "Reliable standard cement for general construction",
    availability: "excellent"
  },
  {
    name: "Ciments du Maroc",
    category: "Cement",
    quality: "standard",
    regions: ["Morocco"],
    priceMultiplier: 0.85,
    description: "Local Moroccan cement, good quality for regional projects",
    availability: "excellent"
  },
  {
    name: "Quikrete",
    category: "Cement",
    quality: "basic",
    regions: ["United States - Northeast", "United States - Southeast", "United States - Midwest", "United States - Southwest", "United States - West Coast"],
    priceMultiplier: 0.8,
    description: "Economy cement for basic construction needs",
    availability: "excellent"
  },

  // Block/Brick Brands
  {
    name: "Wienerberger",
    category: "Blocks",
    quality: "premium",
    regions: ["France", "United Kingdom", "Austria"],
    priceMultiplier: 1.4,
    description: "Premium European clay bricks with excellent thermal properties",
    availability: "good"
  },
  {
    name: "Parpaing Standard",
    category: "Blocks",
    quality: "standard",
    regions: ["France", "Morocco"],
    priceMultiplier: 1.0,
    description: "Standard concrete blocks for walls and structures",
    availability: "excellent"
  },
  {
    name: "Briques du Maroc",
    category: "Blocks",
    quality: "basic",
    regions: ["Morocco"],
    priceMultiplier: 0.7,
    description: "Affordable Moroccan clay bricks",
    availability: "excellent"
  },

  // Roofing Brands
  {
    name: "Imerys",
    category: "Roofing",
    quality: "premium",
    regions: ["France", "United Kingdom"],
    priceMultiplier: 1.5,
    description: "Premium French roof tiles, durable and aesthetic",
    availability: "good"
  },
  {
    name: "Tuiles du Maroc",
    category: "Roofing",
    quality: "standard",
    regions: ["Morocco"],
    priceMultiplier: 0.9,
    description: "Moroccan clay tiles suitable for Mediterranean climate",
    availability: "excellent"
  },
  {
    name: "Bacacier",
    category: "Roofing",
    quality: "standard",
    regions: ["France", "Morocco"],
    priceMultiplier: 1.1,
    description: "Quality metal roofing sheets",
    availability: "excellent"
  },
  {
    name: "GAF",
    category: "Roofing",
    quality: "premium",
    regions: ["United States - Northeast", "United States - Southeast", "United States - Midwest", "United States - Southwest", "United States - West Coast", "Canada"],
    priceMultiplier: 1.4,
    description: "Top North American roofing brand",
    availability: "excellent"
  },

  // Paint Brands
  {
    name: "Dulux",
    category: "Paint",
    quality: "premium",
    regions: ["France", "United Kingdom", "Australia"],
    priceMultiplier: 1.4,
    description: "Premium paint with excellent coverage and durability",
    availability: "excellent"
  },
  {
    name: "Maestria",
    category: "Paint",
    quality: "standard",
    regions: ["Morocco"],
    priceMultiplier: 0.8,
    description: "Popular Moroccan paint brand for interior/exterior",
    availability: "excellent"
  },
  {
    name: "Zolpan",
    category: "Paint",
    quality: "premium",
    regions: ["France"],
    priceMultiplier: 1.3,
    description: "French premium paint for professionals",
    availability: "excellent"
  },
  {
    name: "Sherwin-Williams",
    category: "Paint",
    quality: "premium",
    regions: ["United States - Northeast", "United States - Southeast", "United States - Midwest", "United States - Southwest", "United States - West Coast", "Canada"],
    priceMultiplier: 1.35,
    description: "Premium American paint brand",
    availability: "excellent"
  },

  // Tiles Brands
  {
    name: "Porcelanosa",
    category: "Tiles",
    quality: "premium",
    regions: ["France", "Morocco"],
    priceMultiplier: 1.6,
    description: "Luxury Spanish tiles available in North Africa and Europe",
    availability: "good"
  },
  {
    name: "Zellige Fes",
    category: "Tiles",
    quality: "premium",
    regions: ["Morocco"],
    priceMultiplier: 1.2,
    description: "Traditional Moroccan mosaic tiles, artisanal quality",
    availability: "good"
  },
  {
    name: "Ceramica",
    category: "Tiles",
    quality: "standard",
    regions: ["Morocco"],
    priceMultiplier: 0.7,
    description: "Standard ceramic tiles for flooring",
    availability: "excellent"
  },
  {
    name: "Novoceram",
    category: "Tiles",
    quality: "premium",
    regions: ["France"],
    priceMultiplier: 1.5,
    description: "Premium French porcelain tiles",
    availability: "excellent"
  },

  // Steel/Reinforcement
  {
    name: "ArcelorMittal",
    category: "Steel",
    quality: "premium",
    regions: ["France", "Morocco", "United Kingdom", "Canada"],
    priceMultiplier: 1.3,
    description: "World-leading steel producer, premium reinforcement",
    availability: "excellent"
  },
  {
    name: "Sonasid",
    category: "Steel",
    quality: "standard",
    regions: ["Morocco"],
    priceMultiplier: 0.9,
    description: "Moroccan steel for reinforcement, good quality",
    availability: "excellent"
  },

  // Insulation
  {
    name: "Isover",
    category: "Insulation",
    quality: "premium",
    regions: ["France", "United Kingdom"],
    priceMultiplier: 1.3,
    description: "Premium glass wool and stone wool insulation",
    availability: "excellent"
  },
  {
    name: "Knauf",
    category: "Insulation",
    quality: "standard",
    regions: ["France", "Morocco", "United Kingdom"],
    priceMultiplier: 1.1,
    description: "Reliable insulation products for thermal and acoustic",
    availability: "excellent"
  },

  // Windows & Doors
  {
    name: "Tryba",
    category: "Windows",
    quality: "premium",
    regions: ["France"],
    priceMultiplier: 1.6,
    description: "Premium French PVC and aluminum windows",
    availability: "excellent"
  },
  {
    name: "K-Line",
    category: "Windows",
    quality: "premium",
    regions: ["France"],
    priceMultiplier: 1.7,
    description: "High-end aluminum windows and doors",
    availability: "good"
  },
  {
    name: "Aluplast Maroc",
    category: "Windows",
    quality: "standard",
    regions: ["Morocco"],
    priceMultiplier: 0.8,
    description: "Standard PVC windows for Moroccan market",
    availability: "excellent"
  },
  {
    name: "Pella",
    category: "Windows",
    quality: "premium",
    regions: ["United States - Northeast", "United States - Southeast", "United States - Midwest", "United States - Southwest", "United States - West Coast"],
    priceMultiplier: 1.5,
    description: "Premium American windows and doors",
    availability: "excellent"
  },

  // Plumbing
  {
    name: "Grohe",
    category: "Plumbing",
    quality: "premium",
    regions: ["France", "United Kingdom", "Morocco"],
    priceMultiplier: 1.5,
    description: "Premium German plumbing fixtures",
    availability: "excellent"
  },
  {
    name: "Hansgrohe",
    category: "Plumbing",
    quality: "premium",
    regions: ["France", "United Kingdom"],
    priceMultiplier: 1.6,
    description: "Luxury German bathroom and kitchen fixtures",
    availability: "good"
  },
  {
    name: "Kohler",
    category: "Plumbing",
    quality: "premium",
    regions: ["United States - Northeast", "United States - Southeast", "United States - Midwest", "United States - Southwest", "United States - West Coast"],
    priceMultiplier: 1.4,
    description: "Premium American plumbing brand",
    availability: "excellent"
  },

  // Electrical/Wiring
  {
    name: "Schneider Electric",
    category: "Electrical",
    quality: "premium",
    regions: ["France", "Morocco", "United Kingdom"],
    priceMultiplier: 1.3,
    description: "Premium French electrical equipment and wiring",
    availability: "excellent"
  },
  {
    name: "Legrand",
    category: "Electrical",
    quality: "standard",
    regions: ["France", "Morocco"],
    priceMultiplier: 1.1,
    description: "Reliable electrical installations and switches",
    availability: "excellent"
  },
]

/**
 * Get brand recommendations based on location and quality
 */
export function getBrandRecommendations(
  category: string,
  location: string,
  quality: QualityLevel
): MaterialBrand[] {
  const matchingBrands = materialBrands.filter(
    brand =>
      brand.category === category &&
      brand.regions.includes(location) &&
      brand.quality === quality
  )

  // If no exact quality match, return closest quality
  if (matchingBrands.length === 0) {
    const locationBrands = materialBrands.filter(
      brand =>
        brand.category === category &&
        brand.regions.includes(location)
    )
    
    if (locationBrands.length > 0) {
      return locationBrands.slice(0, 3)
    }
  }

  return matchingBrands.slice(0, 3)
}

/**
 * Map material names to brand categories
 */
export function getMaterialCategory(materialName: string): string {
  const categoryMap: Record<string, string> = {
    'cement': 'Cement',
    'concrete blocks': 'Blocks',
    'bricks': 'Blocks',
    'roofing': 'Roofing',
    'paint': 'Paint',
    'tiles': 'Tiles',
    'floor tiles': 'Tiles',
    'steel': 'Steel',
    'insulation': 'Insulation',
    'windows': 'Windows',
    'doors': 'Windows',
    'plumbing': 'Plumbing',
    'electrical': 'Electrical',
    'wiring': 'Electrical'
  }

  const lowerName = materialName.toLowerCase()
  for (const [key, category] of Object.entries(categoryMap)) {
    if (lowerName.includes(key)) {
      return category
    }
  }

  return 'Other'
}

/**
 * Get all available brands for a material in a location
 */
export function getAllBrandsForMaterial(
  materialName: string,
  location: string
): MaterialBrand[] {
  const category = getMaterialCategory(materialName)
  
  return materialBrands.filter(
    brand =>
      brand.category === category &&
      brand.regions.includes(location)
  ).sort((a, b) => {
    // Sort by quality tier and then by price
    const qualityOrder = { premium: 0, standard: 1, basic: 2 }
    return qualityOrder[a.quality] - qualityOrder[b.quality]
  })
}
