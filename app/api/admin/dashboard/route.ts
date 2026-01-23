import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    // Check JWT authentication
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: { role: true }
    })

    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get date range for comparison
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Get current month stats
    const [
      currentMonthOrders,
      lastMonthOrders,
      totalProducts,
      totalUsers,
      lastMonthUsers,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ])

    // Count low stock products separately
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        stock: { lt: 50 }, // Products with less than 50 in stock
      },
    })

    const currentRevenue = currentMonthOrders._sum.totalAmount || 0
    const lastRevenue = lastMonthOrders._sum.totalAmount || 0
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0

    const currentOrders = currentMonthOrders._count
    const lastOrders = lastMonthOrders._count
    const ordersChange = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0

    const usersChange = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

    // Get revenue by month - simple aggregation without raw SQL
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    })

    // Group by month manually
    const revenueByMonthMap = new Map<string, number>()
    allOrders.forEach(order => {
      const monthKey = order.createdAt.toLocaleDateString('en-US', { month: 'short' })
      const current = revenueByMonthMap.get(monthKey) || 0
      revenueByMonthMap.set(monthKey, current + order.totalAmount)
    })

    const revenueByMonth = Array.from(revenueByMonthMap.entries()).map(([month, revenue]) => ({
      month,
      revenue
    }))

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true },
      _count: { quantity: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 5,
    })

    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, imageUrl: true, category: true },
        })
        return {
          ...product,
          id: item.productId,
          revenue: item._sum.price || 0,
          sales: item._count.quantity,
        }
      })
    )

    // Get recent orders
    const recentOrdersData = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          select: { 
            quantity: true,
            product: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Get low stock products list
    const lowStockProductsList = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lt: 50 } // Products with stock < 50
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        maxStock: true,
        category: true,
        imageUrl: true
      },
      orderBy: { stock: 'asc' },
      take: 10
    })

    return NextResponse.json({
      stats: {
        totalRevenue: currentRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalOrders: currentOrders,
        ordersChange: Math.round(ordersChange * 10) / 10,
        totalProducts,
        lowStockProducts,
        totalUsers,
        usersChange: Math.round(usersChange * 10) / 10,
      },
      revenueData: revenueByMonth,
      topProducts: topProductDetails,
      recentOrders: recentOrdersData,
      lowStockProducts: lowStockProductsList,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
