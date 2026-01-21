import type { EstimateResult } from './calculations'

// Location-based price multipliers using AI-powered regional analysis
const locationMultipliers: Record<string, number> = {
  "United States - Northeast": 1.25,
  "United States - Southeast": 0.95,
  "United States - Midwest": 0.90,
  "United States - Southwest": 1.05,
  "United States - West Coast": 1.35,
  "Canada": 1.20,
  "United Kingdom": 1.30,
  "Australia": 1.15,
  "France": 1.28,
  "Morocco": 0.75,
  "Other": 1.00,
}

interface AIAdjustment {
  multiplier: number
  reasoning: string
  marketTrends: string[]
}

/**
 * Use AI to analyze location and provide price adjustments
 * Falls back to base multipliers if AI is unavailable
 */
export async function adjustPricesWithAI(
  result: EstimateResult,
  location: string
): Promise<EstimateResult> {
  try {
    // Try to get AI-powered adjustments
    const aiAdjustment = await getAIPriceAdjustment(location, result.projectDetails.projectType)
    
    // Apply AI-suggested multiplier
    const multiplier = aiAdjustment?.multiplier || locationMultipliers[location] || 1.0
    
    // Adjust all material prices
    const adjustedMaterials = result.materials.map(material => ({
      ...material,
      unitPrice: Math.round(material.unitPrice * multiplier * 100) / 100,
      totalPrice: Math.round(material.totalPrice * multiplier * 100) / 100,
    }))

    // Recalculate totals
    const subtotal = adjustedMaterials.reduce((sum, item) => sum + item.totalPrice, 0)
    const wasteBuffer = subtotal * (result.wasteBufferPercentage / 100)
    const total = subtotal + wasteBuffer

    return {
      ...result,
      materials: adjustedMaterials,
      subtotal: Math.round(subtotal * 100) / 100,
      wasteBuffer: Math.round(wasteBuffer * 100) / 100,
      total: Math.round(total * 100) / 100,
    }
  } catch (error) {
    console.error('AI price adjustment failed:', error)
    // Return original result if AI fails
    return result
  }
}

/**
 * Get AI-powered price adjustment based on current market conditions
 */
async function getAIPriceAdjustment(
  location: string,
  projectType: string
): Promise<AIAdjustment | null> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.log('OpenAI API key not configured, using base multipliers')
    return null
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a construction cost expert. Analyze regional material costs and provide price multipliers based on current market conditions. Respond ONLY with valid JSON.'
          },
          {
            role: 'user',
            content: `Analyze construction material costs for ${projectType} project in ${location}. Consider current 2026 market conditions, supply chain, labor costs, and regional factors. Provide a price multiplier (baseline 1.0) and brief reasoning. Response format: {"multiplier": number, "reasoning": "brief explanation", "marketTrends": ["trend1", "trend2"]}`
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) {
      return null
    }

    // Parse JSON response
    const parsed = JSON.parse(content)
    
    // Validate multiplier is reasonable (0.7 to 1.8)
    if (parsed.multiplier < 0.7 || parsed.multiplier > 1.8) {
      parsed.multiplier = Math.max(0.7, Math.min(1.8, parsed.multiplier))
    }

    return parsed
  } catch (error) {
    console.error('OpenAI API call failed:', error)
    return null
  }
}

/**
 * Get AI-powered seasonal pricing recommendations
 */
export async function getSeasonalPricing(
  materials: string[],
  location: string
): Promise<{ material: string; advice: string }[]> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return []
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a construction procurement expert. Provide brief seasonal buying advice for materials.'
          },
          {
            role: 'user',
            content: `Current date: January 2026. Location: ${location}. Materials: ${materials.join(', ')}. For each material, provide one-sentence seasonal buying advice. Format as JSON array: [{"material": "name", "advice": "advice"}]`
          }
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) {
      return []
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Seasonal pricing AI failed:', error)
    return []
  }
}
