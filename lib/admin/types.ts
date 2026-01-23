// Admin types based on Prisma schema
// These mirror the Prisma models for use in the front-end

export type UserRole = "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER"
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  avatar: string | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  unit: string
  sku: string
  barcode: string | null
  stock: number
  minStock: number
  maxStock: number | null
  categoryId: string
  category?: Category
  imageUrl: string | null
  images: string[]
  isFeatured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: User
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: string | null
  billingAddress: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  total: number
}

export interface StockMovement {
  id: string
  productId: string
  product?: Product
  type: "IN" | "OUT" | "ADJUSTMENT"
  quantity: number
  reason: string | null
  reference: string | null
  createdAt: Date
  createdBy: string | null
}

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalProducts: number
  lowStockProducts: number
  totalUsers: number
  usersChange: number
}

export interface RevenueData {
  month: string
  revenue: number
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
}
