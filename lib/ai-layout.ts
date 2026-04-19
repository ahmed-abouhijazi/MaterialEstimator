import type { ProjectType, QualityLevel } from './calculations'

export interface AILayoutInput {
  projectType: ProjectType
  estimationMode: 'simple' | 'advanced'
  length: number
  width: number
  height: number
  numberOfRooms: number
  numberOfBathrooms: number
  numberOfFloors: number
  hasPlumbing: boolean
  hasElectricity: boolean
  qualityLevel?: QualityLevel
  layoutIntent?: 'open' | 'balanced' | 'zoned'
  styleMood?: 'modern' | 'warm' | 'scandi' | 'industrial'
  furnitureDensity?: 'minimal' | 'balanced' | 'cozy'
  lightingMood?: 'bright' | 'neutral' | 'cozy'
  hasBalcony?: boolean
}

export interface AILayoutSuggestion {
  style: 'minimal' | 'modern' | 'warm' | 'industrial'
  openness: number
  zoneWeights: {
    living: number
    kitchen: number
    bedroom: number
    bathroom: number
  }
  features: {
    islandKitchen: boolean
    openLiving: boolean
    patio: boolean
    extraStorage: boolean
  }
  palette: {
    wall: string
    floor: string
    accent: string
  }
  lighting: 'bright' | 'neutral' | 'cozy'
  furniture: {
    density: 'minimal' | 'balanced' | 'cozy'
    tone: 'light' | 'dark' | 'mixed'
  }
  surfaces: {
    floorMaterial: 'light_wood' | 'dark_wood' | 'stone' | 'concrete' | 'tile'
    accentMaterial: 'wood' | 'metal' | 'stone'
  }
  generatedByAI: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(value: string, fallback: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value
  return fallback
}

function fallbackLayout(input: AILayoutInput): AILayoutSuggestion {
  const compactness = input.length * input.width < 110
  const advanced = input.estimationMode === 'advanced'
  const mood = input.styleMood ?? (compactness ? 'minimal' : 'modern')
  const density = input.furnitureDensity ?? (compactness ? 'balanced' : 'cozy')
  const lighting: AILayoutSuggestion['lighting'] = input.lightingMood ?? (input.qualityLevel === 'premium' ? 'bright' : 'neutral')
  const tone: AILayoutSuggestion['furniture']['tone'] = mood === 'industrial' ? 'dark' : mood === 'warm' ? 'mixed' : 'light'
  const floorMaterial: AILayoutSuggestion['surfaces']['floorMaterial'] = mood === 'industrial' ? 'concrete' : compactness ? 'light_wood' : 'dark_wood'
  const accentMaterial: AILayoutSuggestion['surfaces']['accentMaterial'] = tone === 'dark' ? 'metal' : 'wood'

  return {
    style: mood,
    openness: clamp((input.numberOfRooms <= 3 ? 0.7 : 0.45) + (advanced ? 0.08 : 0) + (input.layoutIntent === 'open' ? 0.1 : input.layoutIntent === 'zoned' ? -0.08 : 0), 0.2, 0.9),
    zoneWeights: {
      living: compactness ? 1.2 : 1.08,
      kitchen: advanced ? 1.15 : 1.05,
      bedroom: input.numberOfRooms > 4 ? 1.1 : 1,
      bathroom: input.numberOfBathrooms > 2 ? 1.18 : 1,
    },
    features: {
      islandKitchen: advanced && input.length > 10,
      openLiving: input.layoutIntent !== 'zoned' && input.projectType !== 'wall' && input.projectType !== 'foundation',
      patio: (input.hasBalcony ?? true) && input.length > 9 && input.width > 8,
      extraStorage: input.numberOfRooms >= 4,
    },
    palette: {
      wall: mood === 'industrial' ? '#e7e7e5' : mood === 'warm' ? '#f3eee4' : '#f1eee7',
      floor: floorMaterial === 'dark_wood' ? '#c6b39a' : floorMaterial === 'light_wood' ? '#d9d2c4' : '#d7cfbf',
      accent: tone === 'dark' ? '#5f6773' : tone === 'mixed' ? '#7a8575' : '#6a7d8a',
    },
    lighting,
    furniture: {
      density,
      tone,
    },
    surfaces: {
      floorMaterial,
      accentMaterial,
    },
    generatedByAI: false,
  }
}

export async function generateAILayout(input: AILayoutInput): Promise<AILayoutSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return fallbackLayout(input)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.45,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are an architectural space-planning assistant. Return only valid JSON with realistic interior layout style hints for a 3D estimator scene. Keep values practical and coherent. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: `Generate a 3D interior layout suggestion for this project input: ${JSON.stringify(input)}.\nReturn JSON with this exact shape: {"style":"minimal|modern|warm|industrial","openness":number(0.2-0.9),"zoneWeights":{"living":number(0.7-1.4),"kitchen":number(0.7-1.4),"bedroom":number(0.7-1.4),"bathroom":number(0.7-1.4)},"features":{"islandKitchen":boolean,"openLiving":boolean,"patio":boolean,"extraStorage":boolean},"palette":{"wall":"#RRGGBB","floor":"#RRGGBB","accent":"#RRGGBB"},"lighting":"bright|neutral|cozy","furniture":{"density":"minimal|balanced|cozy","tone":"light|dark|mixed"},"surfaces":{"floorMaterial":"light_wood|dark_wood|stone|concrete|tile","accentMaterial":"wood|metal|stone"}}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      return fallbackLayout(input)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return fallbackLayout(input)
    }

    const parsed = JSON.parse(content)
    const fallback = fallbackLayout(input)

    return {
      style: ['minimal', 'modern', 'warm', 'industrial'].includes(parsed?.style) ? parsed.style : fallback.style,
      openness: clamp(Number(parsed?.openness ?? fallback.openness), 0.2, 0.9),
      zoneWeights: {
        living: clamp(Number(parsed?.zoneWeights?.living ?? fallback.zoneWeights.living), 0.7, 1.4),
        kitchen: clamp(Number(parsed?.zoneWeights?.kitchen ?? fallback.zoneWeights.kitchen), 0.7, 1.4),
        bedroom: clamp(Number(parsed?.zoneWeights?.bedroom ?? fallback.zoneWeights.bedroom), 0.7, 1.4),
        bathroom: clamp(Number(parsed?.zoneWeights?.bathroom ?? fallback.zoneWeights.bathroom), 0.7, 1.4),
      },
      features: {
        islandKitchen: Boolean(parsed?.features?.islandKitchen ?? fallback.features.islandKitchen),
        openLiving: Boolean(parsed?.features?.openLiving ?? fallback.features.openLiving),
        patio: Boolean(parsed?.features?.patio ?? fallback.features.patio),
        extraStorage: Boolean(parsed?.features?.extraStorage ?? fallback.features.extraStorage),
      },
      palette: {
        wall: normalizeHex(String(parsed?.palette?.wall ?? ''), fallback.palette.wall),
        floor: normalizeHex(String(parsed?.palette?.floor ?? ''), fallback.palette.floor),
        accent: normalizeHex(String(parsed?.palette?.accent ?? ''), fallback.palette.accent),
      },
      lighting: ['bright', 'neutral', 'cozy'].includes(parsed?.lighting) ? parsed.lighting : fallback.lighting,
      furniture: {
        density: ['minimal', 'balanced', 'cozy'].includes(parsed?.furniture?.density) ? parsed.furniture.density : fallback.furniture.density,
        tone: ['light', 'dark', 'mixed'].includes(parsed?.furniture?.tone) ? parsed.furniture.tone : fallback.furniture.tone,
      },
      surfaces: {
        floorMaterial: ['light_wood', 'dark_wood', 'stone', 'concrete', 'tile'].includes(parsed?.surfaces?.floorMaterial)
          ? parsed.surfaces.floorMaterial
          : fallback.surfaces.floorMaterial,
        accentMaterial: ['wood', 'metal', 'stone'].includes(parsed?.surfaces?.accentMaterial)
          ? parsed.surfaces.accentMaterial
          : fallback.surfaces.accentMaterial,
      },
      generatedByAI: true,
    }
  } catch (error) {
    console.error('AI layout generation failed:', error)
    return fallbackLayout(input)
  }
}
