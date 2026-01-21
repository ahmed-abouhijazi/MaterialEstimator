import type { ProjectType } from './calculations'

export interface MarketInsight {
  insight: string
  category: 'cost' | 'timing' | 'material' | 'general'
  priority: 'high' | 'medium' | 'low'
}

/**
 * Get AI-powered market insights and recommendations
 */
export async function getMarketInsights(
  projectType: ProjectType,
  location: string,
  budget?: number
): Promise<MarketInsight[]> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return getFallbackInsights(projectType, location)
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
            content: 'You are a construction project advisor. Provide practical insights about construction projects based on current market conditions in 2026. Be specific and actionable.'
          },
          {
            role: 'user',
            content: `Project: ${projectType} in ${location}${budget ? `, Budget: $${budget}` : ''}. Provide 5 key insights covering: cost optimization, timing recommendations, material choices, and general advice. Format as JSON: [{"insight": "text", "category": "cost|timing|material|general", "priority": "high|medium|low"}]`
          }
        ],
        temperature: 0.5,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      return getFallbackInsights(projectType, location)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) {
      return getFallbackInsights(projectType, location)
    }

    const insights = JSON.parse(content)
    return Array.isArray(insights) ? insights : getFallbackInsights(projectType, location)
  } catch (error) {
    console.error('Market insights AI failed:', error)
    return getFallbackInsights(projectType, location)
  }
}

/**
 * Fallback insights when AI is unavailable
 */
function getFallbackInsights(projectType: ProjectType, location: string): MarketInsight[] {
  const insights: MarketInsight[] = [
    {
      insight: 'Purchase materials in bulk to negotiate better prices with suppliers.',
      category: 'cost',
      priority: 'high'
    },
    {
      insight: 'Q1 2026 is typically a slower season, you may find better contractor availability.',
      category: 'timing',
      priority: 'medium'
    },
    {
      insight: 'Consider getting quotes from 3-5 contractors to ensure competitive pricing.',
      category: 'cost',
      priority: 'high'
    }
  ]

  // Add project-specific insights
  if (projectType === 'house') {
    insights.push({
      insight: 'For full house construction, consider energy-efficient materials for long-term savings.',
      category: 'material',
      priority: 'medium'
    })
  } else if (projectType === 'roof') {
    insights.push({
      insight: 'Roofing projects are best done in dry seasons to avoid weather delays.',
      category: 'timing',
      priority: 'high'
    })
  }

  // Add location-specific insights
  if (location.includes('West Coast')) {
    insights.push({
      insight: 'West Coast has higher labor costs but better access to sustainable materials.',
      category: 'general',
      priority: 'medium'
    })
  }

  return insights.slice(0, 5)
}

/**
 * Get AI recommendations for material substitutions
 */
export async function getMaterialAlternatives(
  materialName: string,
  projectType: ProjectType,
  budget: 'low' | 'medium' | 'high'
): Promise<{ alternative: string; reason: string; savings: string }[]> {
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
            content: 'You are a construction materials expert. Suggest practical alternatives to construction materials based on budget.'
          },
          {
            role: 'user',
            content: `Material: ${materialName}, Project: ${projectType}, Budget: ${budget}. Suggest 2-3 alternative materials with reasons and estimated savings. Format as JSON: [{"alternative": "name", "reason": "why", "savings": "percentage or amount"}]`
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
    console.error('Material alternatives AI failed:', error)
    return []
  }
}
