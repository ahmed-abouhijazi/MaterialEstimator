import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Fetch user's estimates
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const estimates = await prisma.estimate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ estimates })
  } catch (error) {
    console.error('Error fetching estimates:', error)
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 })
  }
}

// POST - Create a new estimate
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { projectName, location, currency, materials, pricing } = body

    const estimate = await prisma.estimate.create({
      data: {
        userId: user.id,
        projectName,
        location,
        currency,
        materials,
        totalCost: pricing.totalCost,
        materialCost: pricing.materialCost,
        laborCost: pricing.laborCost,
        equipmentCost: pricing.equipmentCost,
        contingency: pricing.contingency
      }
    })

    return NextResponse.json({ estimate }, { status: 201 })
  } catch (error) {
    console.error('Error creating estimate:', error)
    return NextResponse.json({ error: 'Failed to create estimate' }, { status: 500 })
  }
}

// DELETE - Delete an estimate
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Estimate ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership
    const estimate = await prisma.estimate.findUnique({
      where: { id }
    })

    if (!estimate || estimate.userId !== user.id) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
    }

    await prisma.estimate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting estimate:', error)
    return NextResponse.json({ error: 'Failed to delete estimate' }, { status: 500 })
  }
}
