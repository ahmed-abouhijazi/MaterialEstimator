import { NextRequest, NextResponse } from 'next/server'
import { calculateMaterials, type ProjectInput } from '@/lib/calculations'
import { adjustPricesWithAI } from '@/lib/ai-pricing'

export async function POST(request: NextRequest) {
  try {
    const body: ProjectInput = await request.json()

    // Validate input
    if (!body.projectType || !body.length || !body.width || !body.height || !body.location || !body.qualityLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic calculation
    let result = calculateMaterials(body)

    // Apply AI-powered price adjustments based on location
    try {
      result = await adjustPricesWithAI(result, body.location)
    } catch (aiError) {
      console.error('AI pricing adjustment failed, using base prices:', aiError)
      // Continue with base prices if AI fails
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Estimation API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate estimate' },
      { status: 500 }
    )
  }
}
