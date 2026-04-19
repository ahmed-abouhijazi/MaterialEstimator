import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const DEFAULT_PLAN = 'pro'
const planDurations: Record<string, number> = {
  pro: 30,
  contractor: 30,
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function parseStatus(rawStatus: string | null | undefined) {
  const normalized = rawStatus || 'none'
  const [state, plan] = normalized.split(':')
  return {
    state: state || 'none',
    plan: plan || DEFAULT_PLAN,
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionStatus: true,
        subscriptionEndDate: true,
        trialUsed: true,
        estimateCount: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { state, plan } = parseStatus(user.subscriptionStatus)
    const now = new Date()
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const isActive = state === 'active' && endDate !== null && endDate > now
    const isExpired = state === 'active' && endDate !== null && endDate <= now

    return NextResponse.json({
      plan,
      status: state,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      daysRemaining,
      isActive,
      isExpired,
      trialUsed: user.trialUsed,
      estimateCount: user.estimateCount,
    })
  } catch (error) {
    console.error('Subscription manage GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const action = String(body?.action || '').toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionStatus: true, subscriptionEndDate: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { state, plan } = parseStatus(user.subscriptionStatus)
    const now = new Date()
    const baseDate = user.subscriptionEndDate && user.subscriptionEndDate > now ? user.subscriptionEndDate : now
    const durationDays = planDurations[plan] || planDurations[DEFAULT_PLAN]

    if (action === 'cancel') {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: `cancelled:${plan}`,
          subscriptionEndDate: null,
        },
        select: { subscriptionStatus: true, subscriptionEndDate: true },
      })

      return NextResponse.json({
        status: updated.subscriptionStatus,
        subscriptionEndDate: updated.subscriptionEndDate,
        message: 'Subscription cancelled.',
      })
    }

    if (action === 'resume' || action === 'extend') {
      const newEndDate = addDays(baseDate, durationDays)
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: `active:${plan}`,
          subscriptionEndDate: newEndDate,
        },
        select: { subscriptionStatus: true, subscriptionEndDate: true },
      })

      return NextResponse.json({
        status: updated.subscriptionStatus,
        subscriptionEndDate: updated.subscriptionEndDate,
        message: action === 'resume' ? 'Subscription resumed for 30 days.' : 'Subscription extended by 30 days.',
      })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Subscription manage POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
