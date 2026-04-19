import { NextRequest, NextResponse } from 'next/server'

// ─── Provider selection ───────────────────────────────────────────────────────
// Priority: GITHUB_TOKEN (Copilot) → OPENAI_API_KEY → no AI
function getProvider(): { apiKey: string; baseUrl: string; model: string } | null {
  if (process.env.GITHUB_TOKEN) {
    return { apiKey: process.env.GITHUB_TOKEN, baseUrl: 'https://models.inference.ai.azure.com', model: 'gpt-4o-mini' }
  }
  if (process.env.OPENAI_API_KEY) {
    return { apiKey: process.env.OPENAI_API_KEY, baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }
  }
  return null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are BuildCalc Pro AI — a friendly and knowledgeable construction assistant built into BuildCalc Pro, an AI-powered material estimator app.

You help users with:
- Construction material questions (quantities, types, specs)
- Cost estimation advice and regional pricing
- Project planning: houses, extensions, rooms, walls, roofs, foundations, renovations
- Building regulations and best practices
- Understanding their estimate results
- Material brand recommendations
- Tips to reduce costs or improve quality

Keep responses concise, practical, and focused on construction/building topics.
Use simple, clear language. When relevant, mention that users can get a full AI-powered estimate using the Estimator tool.
Do not answer questions unrelated to construction, building, or home improvement.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { messages?: ChatMessage[]; locale?: string }
    const messages: ChatMessage[] = body.messages ?? []
    const locale = typeof body.locale === 'string' ? body.locale : 'en'

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    // Validate— only allow 'user' and 'assistant' roles, truncate to last 20 turns (memory efficiency)
    const safeMessages = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))

    const provider = getProvider()

    if (!provider) {
      return NextResponse.json({
        message: "I'm sorry, no AI provider is configured right now. Please check your API keys.",
        fallback: true,
      })
    }

    const langInstruction =
      locale === 'fr' ? 'Réponds toujours en français, de manière claire et concise.' :
      'Respond in English.'

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.6,
        max_tokens: 600,
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}

${langInstruction}` },
          ...safeMessages,
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Chat] API error:', response.status, errorText)
      return NextResponse.json({ error: `AI API error: ${response.status}` }, { status: 502 })
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] }
    const content = data?.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    return NextResponse.json({ message: content })
  } catch (error) {
    console.error('[Chat] Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
