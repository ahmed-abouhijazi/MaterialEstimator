import { NextRequest, NextResponse } from 'next/server'
import { getMarketInsights } from '@/lib/ai-insights'

export async function POST(request: NextRequest) {
  try {
    const { projectType, location, budget } = await request.json()

    if (!projectType || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const insights = await getMarketInsights(projectType, location, budget)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('AI insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
