import { NextRequest, NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIRoom {
  id: string
  label: string
  sub: string
  /** Fraction of building width [0–1] */
  xFrac: number
  /** Fraction of building depth [0–1] */
  yFrac: number
  /** Fraction of building width */
  wFrac: number
  /** Fraction of building depth */
  hFrac: number
}

export interface AIFloorPlanLayout {
  rooms: AIRoom[]
  /** Fraction of building width where main entry arrow sits */
  entryXFrac: number
  hasStairs: boolean
  stairsXFrac: number
  stairsYFrac: number
  generatedByAI: boolean
}

// ─── Provider selection ───────────────────────────────────────────────────────
// Priority: GITHUB_TOKEN (Copilot) → OPENAI_API_KEY → deterministic fallback

function getProvider(): { apiKey: string; baseUrl: string; model: string } | null {
  if (process.env.GITHUB_TOKEN) {
    return {
      apiKey: process.env.GITHUB_TOKEN,
      baseUrl: 'https://models.inference.ai.azure.com',
      model: 'gpt-4o-mini',
    }
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    }
  }
  return null
}

// ─── Deterministic fallback ───────────────────────────────────────────────────

function buildFallbackLayout(
  projectType: string,
  nRooms: number,
  nBaths: number,
  nFloors: number,
  hasBalcony: boolean,
): AIFloorPlanLayout {
  const rooms: AIRoom[] = []

  const isResidential = ['house', 'extension', 'renovation'].includes(projectType)
  if (!isResidential) {
    rooms.push({ id: 'main', label: projectType.toUpperCase(), sub: '', xFrac: 0, yFrac: 0, wFrac: 1, hFrac: 1 })
    return { rooms, entryXFrac: 0.5, hasStairs: false, stairsXFrac: 0.5, stairsYFrac: 0.28, generatedByAI: false }
  }

  const lFrac = 0.38
  const rFrac = 1 - lFrac
  const topFrac = 0.30
  const midFrac = 0.40
  const botFrac = 1 - topFrac - midFrac

  // Left column
  rooms.push({ id: 'bathroom', label: 'BATHROOM', sub: 'TILE', xFrac: 0, yFrac: 0, wFrac: lFrac, hFrac: topFrac * 0.56 })
  rooms.push({ id: 'closet', label: 'CLOSET', sub: 'CARPET', xFrac: 0, yFrac: topFrac * 0.56, wFrac: lFrac * 0.62, hFrac: topFrac * 0.44 })
  rooms.push({ id: 'counter', label: 'COUNTER', sub: '', xFrac: lFrac * 0.62, yFrac: topFrac * 0.56, wFrac: lFrac * 0.38, hFrac: topFrac * 0.44 })
  rooms.push({ id: 'kitchen', label: 'KITCHEN', sub: 'SHEET VINYL FLOOR', xFrac: 0, yFrac: topFrac, wFrac: lFrac, hFrac: midFrac })
  rooms.push({ id: 'dining', label: 'DINING', sub: 'SHEET VINYL FLOOR', xFrac: 0, yFrac: topFrac + midFrac, wFrac: lFrac, hFrac: botFrac })

  // Right column
  const count = Math.max(1, nRooms)
  if (count === 1) {
    rooms.push({ id: 'bed1', label: 'BEDROOM', sub: 'CARPET', xFrac: lFrac, yFrac: 0, wFrac: rFrac, hFrac: topFrac })
    rooms.push({ id: 'living', label: 'LIVING ROOM', sub: 'WOOD FLOOR', xFrac: lFrac, yFrac: topFrac, wFrac: rFrac, hFrac: midFrac + botFrac })
  } else if (count === 2) {
    rooms.push({ id: 'bed1', label: 'BEDROOM 1', sub: 'CARPET', xFrac: lFrac, yFrac: 0, wFrac: rFrac, hFrac: topFrac })
    rooms.push({ id: 'living', label: 'LIVING ROOM', sub: 'WOOD FLOOR', xFrac: lFrac, yFrac: topFrac, wFrac: rFrac, hFrac: midFrac })
    rooms.push({ id: 'bed2', label: 'BEDROOM 2', sub: 'CARPET', xFrac: lFrac, yFrac: topFrac + midFrac, wFrac: rFrac, hFrac: botFrac })
  } else {
    const split = rFrac * 0.48
    rooms.push({ id: 'bed1', label: 'BEDROOM 2', sub: 'CARPET', xFrac: lFrac, yFrac: 0, wFrac: split, hFrac: topFrac })
    rooms.push({ id: 'bed2', label: 'BEDROOM 3', sub: 'CARPET', xFrac: lFrac + split, yFrac: 0, wFrac: rFrac - split, hFrac: topFrac })
    rooms.push({ id: 'living', label: 'LIVING ROOM', sub: 'WOOD FLOOR', xFrac: lFrac, yFrac: topFrac, wFrac: rFrac, hFrac: midFrac })
    rooms.push({ id: 'bed3', label: count >= 4 ? 'BEDROOM 4' : 'BEDROOM 1', sub: 'CARPET', xFrac: lFrac, yFrac: topFrac + midFrac, wFrac: rFrac, hFrac: botFrac })
  }

  return {
    rooms,
    entryXFrac: 0.5,
    hasStairs: nFloors > 1,
    stairsXFrac: lFrac + rFrac * 0.36,
    stairsYFrac: topFrac - 0.04,
    generatedByAI: false,
  }
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function clampFrac(v: unknown, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback
}

function safeString(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

function validateRooms(raw: unknown): AIRoom[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const rooms: AIRoom[] = []
  for (const r of raw) {
    if (typeof r !== 'object' || !r) continue
    rooms.push({
      id:    safeString((r as any).id,    `room-${rooms.length}`),
      label: safeString((r as any).label, 'ROOM'),
      sub:   safeString((r as any).sub,   ''),
      xFrac: clampFrac((r as any).xFrac, 0),
      yFrac: clampFrac((r as any).yFrac, 0),
      wFrac: clampFrac((r as any).wFrac, 0.5),
      hFrac: clampFrac((r as any).hFrac, 0.5),
    })
  }
  return rooms.length > 0 ? rooms : null
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const projectType  = safeString(body.projectType, 'house')
  const nRooms       = Math.max(1, Math.round(Number(body.numberOfRooms       ?? 3)))
  const nBaths       = Math.max(1, Math.round(Number(body.numberOfBathrooms   ?? 1)))
  const nFloors      = Math.max(1, Math.round(Number(body.numberOfFloors      ?? 1)))
  const length       = Math.max(3, Number(body.length ?? 10))
  const width        = Math.max(3, Number(body.width  ?? 8))
  const hasBalcony   = Boolean(body.hasBalcony ?? true)
  const layoutIntent = safeString(body.layoutIntent, 'balanced')

  console.log('[AI FloorPlan] ► Request:', { projectType, length, width, nRooms, nBaths, nFloors, hasBalcony, layoutIntent })

  const provider = getProvider()
  if (!provider) {
    console.log('[AI FloorPlan] ✗ No API key found (GITHUB_TOKEN or OPENAI_API_KEY) — using deterministic fallback')
    return NextResponse.json(buildFallbackLayout(projectType, nRooms, nBaths, nFloors, hasBalcony))
  }
  console.log(`[AI FloorPlan] ► Using provider: ${provider.model} @ ${provider.baseUrl}`)

  const systemPrompt = `You are an expert architectural floor-plan layout assistant.
Given a project's dimensions and program, return a JSON object describing rooms as fractional positions within the building footprint.
Rules:
- All xFrac+wFrac values must stay ≤ 1.0 and yFrac+hFrac ≤ 1.0.
- Rooms must not overlap significantly.
- Together the rooms should cover most of the floor area.
- Use realistic labels (ALL CAPS) and finish names (e.g. WOOD FLOOR, TILE, CARPET, SHEET VINYL FLOOR).
- Respond with ONLY valid JSON, no explanation.`

  const userPrompt = `Project:
- type: ${projectType}
- length: ${length}m, width: ${width}m
- rooms: ${nRooms}, bathrooms: ${nBaths}, floors: ${nFloors}
- layoutIntent: ${layoutIntent}, hasBalcony: ${hasBalcony}

Return JSON with this exact shape:
{
  "rooms": [
    { "id": string, "label": string, "sub": string,
      "xFrac": number, "yFrac": number, "wFrac": number, "hFrac": number }
  ],
  "entryXFrac": number,
  "hasStairs": boolean,
  "stairsXFrac": number,
  "stairsYFrac": number
}
Where all Frac values are between 0 and 1 (fraction of building footprint).`

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
    })

    console.log(`[AI FloorPlan] ► API response status: ${response.status}`)
    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn('[AI FloorPlan] ✗ API error body:', errText)
      return NextResponse.json(buildFallbackLayout(projectType, nRooms, nBaths, nFloors, hasBalcony))
    }

    const data = await response.json()
    console.log('[AI FloorPlan] ► Raw API response:', JSON.stringify(data?.choices?.[0]?.message ?? data, null, 2))

    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      console.warn('[AI FloorPlan] ✗ No content in response, using fallback')
      return NextResponse.json(buildFallbackLayout(projectType, nRooms, nBaths, nFloors, hasBalcony))
    }

    console.log('[AI FloorPlan] ► Raw AI content:', content)

    const parsed = JSON.parse(content)
    const rooms = validateRooms(parsed?.rooms)
    if (!rooms) {
      console.warn('[AI FloorPlan] ✗ Room validation failed, using fallback. Parsed:', JSON.stringify(parsed))
      return NextResponse.json(buildFallbackLayout(projectType, nRooms, nBaths, nFloors, hasBalcony))
    }

    const layout: AIFloorPlanLayout = {
      rooms,
      entryXFrac:  clampFrac(parsed?.entryXFrac,  0.5),
      hasStairs:   Boolean(parsed?.hasStairs ?? nFloors > 1),
      stairsXFrac: clampFrac(parsed?.stairsXFrac, 0.55),
      stairsYFrac: clampFrac(parsed?.stairsYFrac, 0.26),
      generatedByAI: true,
    }

    console.log(`[AI FloorPlan] ✓ Layout generated: ${rooms.length} rooms, generatedByAI=true`)
    console.log('[AI FloorPlan] ► Final layout:', JSON.stringify(layout, null, 2))
    return NextResponse.json(layout)
  } catch (err) {
    console.error('[AI FloorPlan] ✗ Exception:', err)
    return NextResponse.json(buildFallbackLayout(projectType, nRooms, nBaths, nFloors, hasBalcony))
  }
}
