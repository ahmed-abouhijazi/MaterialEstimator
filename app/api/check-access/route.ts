import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      // Guest user - allow 1 trial
      return NextResponse.json({ 
        canView: true,
        isGuest: true,
        message: 'Sign up to save your estimates and get unlimited access'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        trialUsed: true,
        estimateCount: true,
        subscriptionStatus: true,
        subscriptionEndDate: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription status
    const hasActiveSubscription = 
      user.subscriptionStatus === 'active' && 
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > new Date()

    if (hasActiveSubscription) {
      return NextResponse.json({
        canView: true,
        hasSubscription: true,
        estimatesRemaining: 'unlimited'
      })
    }

    // Check trial status
    if (!user.trialUsed && user.estimateCount === 0) {
      return NextResponse.json({
        canView: true,
        isTrial: true,
        estimatesRemaining: 1,
        message: 'This is your free trial estimate'
      })
    }

    // Trial used, need subscription
    return NextResponse.json({
      canView: false,
      requiresSubscription: true,
      message: 'Your free trial has been used. Subscribe for unlimited estimates!'
    })
  } catch (error) {
    console.error('Error checking access:', error)
    return NextResponse.json({ error: 'Failed to check access' }, { status: 500 })
  }
}
