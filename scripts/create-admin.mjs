import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'

async function createAdminUser() {
  const adminEmail = 'admin@buildcalc.pro'
  const adminPassword = 'admin123' // Change this in production!

  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      // Update to admin role if exists
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          role: 'ADMIN',
          isActive: true
        }
      })
      console.log('✅ Updated existing user to ADMIN role:', adminEmail)
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date()
        }
      })
      console.log('✅ Created admin user:', adminEmail)
    }

    console.log(`
📧 Admin Login Credentials:
   Email: ${adminEmail}
   Password: ${adminPassword}
   
🔒 IMPORTANT: Change the password after first login!
    `)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
