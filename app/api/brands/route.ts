import { NextRequest, NextResponse } from 'next/server'
import { getBrandRecommendations, getAllBrandsForMaterial, getMaterialCategory } from '@/lib/material-brands'
import type { QualityLevel } from '@/lib/calculations'

export async function POST(request: NextRequest) {
  try {
    const { materialName, location, quality } = await request.json()

    if (!materialName || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const category = getMaterialCategory(materialName)
    const recommendations = quality 
      ? getBrandRecommendations(category, location, quality as QualityLevel)
      : getAllBrandsForMaterial(materialName, location)

    return NextResponse.json({ 
      recommendations,
      category 
    })
  } catch (error) {
    console.error('Brand recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to get brand recommendations' },
      { status: 500 }
    )
  }
}
