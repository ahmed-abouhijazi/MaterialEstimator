import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use custom domain if configured, otherwise fall back to resend.dev (testing only)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'BuildCalc Pro <onboarding@resend.dev>'

// Development mode - skip email verification if no domain configured
const isDevelopmentMode = process.env.SKIP_EMAIL_VERIFICATION === 'true' || !process.env.RESEND_FROM_EMAIL

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  // In development mode, log the verification URL instead of sending email
  if (isDevelopmentMode) {
    console.log('\n🔧 DEVELOPMENT MODE - Email Verification Bypassed')
    console.log('📧 To:', email)
    console.log('🔗 Verification URL:', verificationUrl)
    console.log('💡 User will be auto-verified on signup\n')
    return { success: true, developmentMode: true }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - BuildCalc Pro',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to BuildCalc Pro! 🎉</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for signing up! Please verify your email address to activate your account and start using BuildCalc Pro.</p>
                <p><strong>Your free trial includes:</strong></p>
                <ul>
                  <li>✅ 1 Free Material Estimate</li>
                  <li>✅ AI-Powered Pricing</li>
                  <li>✅ 50+ Material Brands</li>
                  <li>✅ Multi-Currency Support</li>
                </ul>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${verificationUrl}
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2026 BuildCalc Pro. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  // In development mode, just log instead of sending
  if (isDevelopmentMode) {
    console.log(`\n🎉 Welcome email would be sent to: ${email} (${name})`)
    return { success: true, developmentMode: true }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to BuildCalc Pro! 🎊',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome Aboard, ${name}! 🚀</h1>
              </div>
              <div class="content">
                <h2>Your Account is Ready!</h2>
                <p>You can now access all BuildCalc Pro features. Start creating professional material estimates today!</p>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/estimator" class="button">Create Your First Estimate</a>
                </div>
                <p><strong>Need help?</strong> Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/how-it-works">How It Works</a> guide.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
  } catch (error) {
    console.error('Welcome email error:', error)
  }
}
