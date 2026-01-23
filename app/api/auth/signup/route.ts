import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Check if in development mode (no email domain configured)
    const isDevelopmentMode = process.env.SKIP_EMAIL_VERIFICATION === 'true' || !process.env.RESEND_FROM_EMAIL

    // Create user (auto-verify in development mode)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: isDevelopmentMode ? new Date() : null, // Auto-verify in dev mode
      },
    })

    // Only create verification token if not in development mode
    if (!isDevelopmentMode) {
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry,
        }
      })
    }

    // Send verification email (will be logged in console in dev mode)
    const emailResult = await sendVerificationEmail(email, verificationToken)

    const message = isDevelopmentMode 
      ? '🎉 Account created and auto-verified! You can now log in.' 
      : 'Account created! Please check your email to verify your account.'

    return NextResponse.json({
      message,
      developmentMode: isDevelopmentMode,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
