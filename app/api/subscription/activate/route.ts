import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const planDurations: Record<string, number> = {
  free: 0,
  pro: 30,
  contractor: 30,
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = String(body?.plan || '').toLowerCase()

    if (!plan || !(plan in planDurations)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionStatus: true, subscriptionEndDate: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (plan === 'free') {
      return NextResponse.json({
        success: true,
        message: 'Free plan selected.',
      })
    }

    const durationDays = planDurations[plan]
    const now = new Date()
    const baseDate = user.subscriptionEndDate && user.subscriptionEndDate > now ? user.subscriptionEndDate : now
    const nextEndDate = addDays(baseDate, durationDays)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: `active:${plan}`,
        subscriptionEndDate: newEndDate,
      },
    })

    return NextResponse.json({
      success: true,
      plan,
      subscriptionStatus: 'active',
      subscriptionEndDate: nextEndDate.toISOString(),
      message: 'Subscription activated without payment verification.',
    })
  } catch (error) {
    console.error('Subscription activation error:', error)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }
}
