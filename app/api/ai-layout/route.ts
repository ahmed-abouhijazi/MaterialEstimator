import { NextRequest, NextResponse } from 'next/server'
import { generateAILayout } from '@/lib/ai-layout'
import type { ProjectType, QualityLevel } from '@/lib/calculations'

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function pickString<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value === 'string' && allowed.includes(value as T)) return value as T
  return fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const projectType = String(body?.projectType || 'house') as ProjectType
    const estimationMode = body?.estimationMode === 'advanced' ? 'advanced' : 'simple'

    const layout = await generateAILayout({
      projectType,
      estimationMode,
      length: toNumber(body?.length, 12),
      width: toNumber(body?.width, 10),
      height: toNumber(body?.height, 3),
      numberOfRooms: Math.max(1, Math.round(toNumber(body?.numberOfRooms, 3))),
      numberOfBathrooms: Math.max(1, Math.round(toNumber(body?.numberOfBathrooms, 1))),
      numberOfFloors: Math.max(1, Math.round(toNumber(body?.numberOfFloors, 1))),
      hasPlumbing: Boolean(body?.hasPlumbing ?? true),
      hasElectricity: Boolean(body?.hasElectricity ?? true),
      qualityLevel: pickString<QualityLevel>(body?.qualityLevel, ['basic', 'standard', 'premium'], 'standard'),
      layoutIntent: pickString(body?.layoutIntent, ['open', 'balanced', 'zoned'] as const, 'balanced'),
      styleMood: pickString(body?.styleMood, ['modern', 'warm', 'scandi', 'industrial'] as const, 'modern'),
      furnitureDensity: pickString(body?.furnitureDensity, ['minimal', 'balanced', 'cozy'] as const, 'balanced'),
      lightingMood: pickString(body?.lightingMood, ['bright', 'neutral', 'cozy'] as const, 'neutral'),
      hasBalcony: Boolean(body?.hasBalcony ?? true),
    })

    return NextResponse.json({ layout })
  } catch (error) {
    console.error('AI layout route error:', error)
    return NextResponse.json({ error: 'Failed to generate AI layout' }, { status: 500 })
  }
}
