import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: "Portland Cement - Type I",
    description: "High-quality Portland cement, perfect for general construction. 50kg bag for concrete and mortar applications.",
    category: "cement",
    price: 12.50,
    currency: "USD",
    unit: "bag",
    stock: 500,
    brand: "LafargeHolcim",
    featured: true,
    specifications: JSON.stringify({
      weight: "50kg",
      type: "Type I Portland Cement",
      standard: "ASTM C150",
    }),
  },
  {
    name: "Ready-Mix Concrete Bags",
    description: "Pre-mixed concrete blend for small projects. Just add water. Ideal for posts, walkways, and repairs.",
    category: "cement",
    price: 8.99,
    currency: "USD",
    unit: "bag",
    stock: 300,
    brand: "Quikrete",
    featured: false,
    specifications: JSON.stringify({
      weight: "40kg",
      coverage: "0.015m³ per bag",
      cureTime: "24-48 hours",
    }),
  },
  {
    name: "Steel Rebar - Grade 60",
    description: "High-strength deformed steel rebar for concrete reinforcement. Corrosion-resistant coating.",
    category: "steel",
    price: 850.00,
    currency: "USD",
    unit: "ton",
    stock: 50,
    brand: "ArcelorMittal",
    featured: true,
    specifications: JSON.stringify({
      grade: "Grade 60",
      diameter: "12mm - 25mm",
      length: "12m",
      standard: "ASTM A615",
    }),
  },
  {
    name: "Galvanized Steel Mesh",
    description: "Welded wire mesh for concrete reinforcement and fence applications. Rust-resistant galvanized finish.",
    category: "steel",
    price: 45.00,
    currency: "USD",
    unit: "sheet",
    stock: 150,
    brand: "BekaertGroup",
    featured: false,
    specifications: JSON.stringify({
      dimensions: "2m x 3m",
      wireGauge: "4mm",
      meshSize: "150mm x 150mm",
    }),
  },
  {
    name: "Pressure-Treated Lumber 2x4",
    description: "Kiln-dried pressure-treated lumber for outdoor construction. Resistant to rot and insects.",
    category: "wood",
    price: 8.50,
    currency: "USD",
    unit: "piece",
    stock: 800,
    brand: "Weyerhaeuser",
    featured: true,
    specifications: JSON.stringify({
      dimensions: "38mm x 89mm",
      length: "2.4m",
      treatment: "ACQ pressure-treated",
      grade: "Construction grade",
    }),
  },
  {
    name: "Plywood Sheets - 18mm",
    description: "Marine-grade plywood sheets for formwork, flooring, and construction applications.",
    category: "wood",
    price: 35.00,
    currency: "USD",
    unit: "sheet",
    stock: 200,
    brand: "Georgia-Pacific",
    featured: false,
    specifications: JSON.stringify({
      thickness: "18mm",
      dimensions: "1.22m x 2.44m",
      grade: "Marine grade",
      finish: "Sanded both sides",
    }),
  },
  {
    name: "Professional Cordless Drill",
    description: "18V lithium-ion cordless drill with 2 batteries and charger. Variable speed with LED light.",
    category: "tools",
    price: 145.00,
    currency: "USD",
    unit: "piece",
    stock: 50,
    brand: "DeWalt",
    featured: true,
    specifications: JSON.stringify({
      voltage: "18V",
      batteryType: "Lithium-ion",
      torque: "60Nm",
      chuckSize: "13mm",
    }),
  },
  {
    name: "Construction Wheelbarrow",
    description: "Heavy-duty steel wheelbarrow with pneumatic tire. 85L capacity for concrete and materials.",
    category: "equipment",
    price: 89.99,
    currency: "USD",
    unit: "piece",
    stock: 75,
    brand: "Jackson",
    featured: false,
    specifications: JSON.stringify({
      capacity: "85L",
      material: "Steel tray",
      wheelType: "Pneumatic tire",
      loadCapacity: "150kg",
    }),
  },
  {
    name: "PVC Drainage Pipe - 110mm",
    description: "High-quality PVC drainage pipe for sewage and stormwater. UV-resistant and durable.",
    category: "pipes",
    price: 12.50,
    currency: "USD",
    unit: "meter",
    stock: 600,
    brand: "JM Eagle",
    featured: false,
    specifications: JSON.stringify({
      diameter: "110mm",
      length: "3m sections",
      material: "PVC",
      standard: "ASTM D3034",
    }),
  },
  {
    name: "Copper Water Pipe - 15mm",
    description: "Type L copper pipe for potable water systems. Lead-free and corrosion-resistant.",
    category: "pipes",
    price: 8.75,
    currency: "USD",
    unit: "meter",
    stock: 400,
    brand: "Mueller",
    featured: true,
    specifications: JSON.stringify({
      diameter: "15mm",
      type: "Type L",
      material: "Copper",
      temperatureRating: "-40°C to 120°C",
    }),
  },
  {
    name: "Electrical Cable 2.5mm²",
    description: "Twin and earth electrical cable for residential wiring. Fire-resistant PVC insulation.",
    category: "wiring",
    price: 2.50,
    currency: "USD",
    unit: "meter",
    stock: 1000,
    brand: "Prysmian",
    featured: false,
    specifications: JSON.stringify({
      conductorSize: "2.5mm²",
      cores: "2 core + earth",
      voltage: "230V",
      standard: "IEC 60227",
    }),
  },
  {
    name: "Exterior Acrylic Paint - White",
    description: "Weather-resistant exterior acrylic paint. Excellent coverage and UV protection.",
    category: "paint",
    price: 45.00,
    currency: "USD",
    unit: "bucket",
    stock: 120,
    brand: "Sherwin-Williams",
    featured: true,
    specifications: JSON.stringify({
      volume: "10L",
      finish: "Satin",
      coverage: "10-12m² per liter",
      dryTime: "2-4 hours",
    }),
  },
  {
    name: "Construction Sand - Fine Grade",
    description: "Washed and graded fine sand for concrete, mortar, and plastering applications.",
    category: "other",
    price: 35.00,
    currency: "USD",
    unit: "ton",
    stock: 200,
    brand: "Local Quarry",
    featured: false,
    specifications: JSON.stringify({
      type: "Fine grade",
      washed: "Yes",
      moisture: "<5%",
      grainSize: "0.1mm - 2mm",
    }),
  },
  {
    name: "Tile Adhesive - Flexible",
    description: "High-performance flexible tile adhesive for ceramic and porcelain tiles. Suitable for floors and walls.",
    category: "other",
    price: 18.50,
    currency: "USD",
    unit: "bag",
    stock: 180,
    brand: "Mapei",
    featured: false,
    specifications: JSON.stringify({
      weight: "25kg",
      coverage: "5-6m² per bag",
      workingTime: "3-4 hours",
      suitable: "Indoor and outdoor",
    }),
  },
  {
    name: "Safety Helmet - Hard Hat",
    description: "ANSI-approved safety helmet with adjustable suspension. Essential for construction sites.",
    category: "equipment",
    price: 22.00,
    currency: "USD",
    unit: "piece",
    stock: 100,
    brand: "3M",
    featured: false,
    specifications: JSON.stringify({
      standard: "ANSI Z89.1",
      material: "High-density polyethylene",
      adjustable: "Yes",
      ventilation: "6 vents",
    }),
  },
]

async function seedProducts() {
  console.log("Starting product seeding...")

  try {
    // Clear existing products (optional - remove if you want to keep existing data)
    // await prisma.product.deleteMany()
    // console.log("Cleared existing products")

    // Create products
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product,
      })
      console.log(`Created product: ${product.name}`)
    }

    console.log(`✅ Successfully seeded ${sampleProducts.length} products!`)
  } catch (error) {
    console.error("Error seeding products:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedProducts()
