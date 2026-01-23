import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') })

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('Connecting to database...')
  console.log('DB URL:', process.env.POSTGRES_PRISMA_DATABASE_URL ? 'Found' : 'NOT FOUND')
  
  try {
    const userCount = await prisma.user.count()
    const orderCount = await prisma.order.count()
    const productCount = await prisma.product.count()
    
    console.log('\n=== DATABASE STATS ===')
    console.log('Total Users:', userCount)
    console.log('Total Orders:', orderCount)
    console.log('Total Products:', productCount)
    
    if (userCount > 0) {
      console.log('\n=== RECENT USERS ===')
      const users = await prisma.user.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' },
        select: { email: true, role: true, name: true }
      })
      users.forEach(u => console.log(`- ${u.email} (${u.role}) - ${u.name || 'No name'}`))
    }
    
    if (orderCount > 0) {
      console.log('\n=== RECENT ORDERS ===')
      const orders = await prisma.order.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' },
        select: { id: true, totalAmount: true, status: true }
      })
      orders.forEach(o => console.log(`- Order ${o.id}: ${o.totalAmount} MAD - ${o.status}`))
    }
    
    if (productCount > 0) {
      console.log('\n=== RECENT PRODUCTS ===')
      const products = await prisma.product.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' },
        select: { name: true, stock: true, price: true }
      })
      products.forEach(p => console.log(`- ${p.name}: ${p.stock} in stock @ ${p.price} MAD`))
    }
    
    console.log('\n✅ Database check complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase().catch(console.error)
