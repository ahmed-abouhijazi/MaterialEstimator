# Email Verification & Trial System Setup

## ✅ Implemented Features

### 1. Email Verification
- Users must verify email after signup
- Verification email sent via Resend
- 24-hour token expiration
- Welcome email after verification
- Login blocked until email verified

### 2. Trial System
- **1 Free Trial** estimate per user
- Trial tracked in database (`trialUsed`, `estimateCount`)
- Guest users redirected to signup after viewing calculator
- Results page protected - requires login after trial

### 3. Subscription System
- Database fields: `subscriptionStatus`, `subscriptionEndDate`
- Status options: `none`, `active`, `cancelled`
- Active subscribers get unlimited estimates
- Trial users see "Subscribe" prompt after first estimate

### 4. Security Improvements
- Email verification required before login
- Protected dashboard route (authentication required)
- Access control on estimate results
- Trial/subscription checking on save
- Middleware protection for sensitive routes

## 📧 Setting Up Resend Email

### Step 1: Create Resend Account
1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify your account

### Step 2: Get API Key
1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name: `BuildCalc Pro`
4. Permission: **Sending access**
5. Click "Add"
6. **Copy the API key** (starts with `re_`)

### Step 3: Add to Vercel
```bash
# Already done via CLI:
vercel env add RESEND_API_KEY production
```

Or manually in Vercel Dashboard:
1. Go to: Project Settings → Environment Variables
2. Add: `RESEND_API_KEY` = `re_your_key_here`
3. Apply to: **Production**, **Preview**, **Development**

### Step 4: Verify Domain (Optional but Recommended)
For production emails from your domain instead of `onboarding@resend.dev`:

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `buildcalcpro.com` (or your domain)
4. Add DNS records to your domain provider
5. Verify domain
6. Update `lib/email.ts`:
   ```typescript
   from: 'BuildCalc Pro <hello@yourdomain.com>'
   ```

## 🔐 How It Works

### Signup Flow:
```
1. User fills signup form
2. Account created (emailVerified = null)
3. Verification email sent
4. User clicks link in email
5. Email verified (emailVerified = timestamp)
6. Welcome email sent
7. User can now login
```

### Login Flow:
```
1. User enters credentials
2. Check if email verified
3. If not verified → show error
4. If verified → create session
5. Redirect to dashboard
```

### Estimate Creation Flow:
```
1. User creates estimate
2. Check trial/subscription status:
   - Guest: Allow view, prompt signup
   - First estimate + verified: Use trial, mark trialUsed
   - Trial used + no subscription: Block, show pricing
   - Active subscription: Allow unlimited
3. Save to database (if authenticated)
4. Update estimateCount
```

## 🧪 Testing Locally

### Test Email Verification:
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/signup`
3. Sign up with a test email
4. Check terminal for verification link (Resend test mode)
5. Click link or visit: `/verify-email?token=...`
6. Try to login before/after verification

### Test Trial System:
1. Sign up and verify email
2. Create first estimate → Should work (trial)
3. Try to create second estimate → Should block
4. Check database: `estimateCount = 1`, `trialUsed = true`

## 📊 Database Schema

```prisma
model User {
  // Existing fields
  emailVerified DateTime?
  
  // New fields
  trialUsed Boolean @default(false)
  estimateCount Int @default(0)
  subscriptionStatus String @default("none")
  subscriptionEndDate DateTime?
}
```

## 🚀 Production Deployment

All features automatically deployed to:
**https://material-estimator-lilac.vercel.app**

### Required Environment Variables:
- ✅ `NEXTAUTH_SECRET` - Set
- ✅ `NEXTAUTH_URL` - Set
- ✅ `POSTGRES_PRISMA_DATABASE_URL` - Set
- ✅ `RESEND_API_KEY` - **Just added**
- ✅ `OPENAI_API_KEY` - Set

## 🎯 User Experience

### For New Users:
1. **Signup** → Email verification link sent
2. **Verify Email** → Welcome message
3. **Login** → Redirected to dashboard
4. **Create Estimate** → First one free (trial)
5. **Save Estimate** → Stored in dashboard
6. **Second Estimate** → Subscription required

### For Existing Users:
- Can login and see dashboard
- View saved estimates
- Create new estimates (if subscription active)
- Upgrade prompt if trial used

### For Guests (Not Logged In):
- Can use calculator
- Can see 1 estimate result
- Prompted to signup to save
- Redirect to signup for more estimates

## 🔄 Migration Status

Database migrations applied:
- ✅ `20260121185358_init` - Initial schema
- ✅ `20260121190632_add_trial_and_subscription` - Trial system

## 📝 Next Steps for Payment Integration

When ready to add payments:
1. Integrate Stripe for subscriptions
2. Add webhook endpoint: `/api/webhooks/stripe`
3. Update `subscriptionStatus` on payment
4. Create pricing page with plans
5. Add billing portal for users

## 🐛 Troubleshooting

### Emails not sending?
- Check RESEND_API_KEY is set correctly
- Verify Resend account is active
- Check server logs for email errors
- Test with Resend dashboard "Logs" tab

### Login fails after signup?
- Check email verification status in database
- Verify token not expired (24h limit)
- Check user.emailVerified is not null

### Trial not working?
- Check user.trialUsed and user.estimateCount
- Verify API `/api/check-access` returns correct status
- Check session is active for authenticated users

## 📧 Support

For issues:
- Check Resend logs: https://resend.com/logs
- Check Vercel logs: `vercel logs`
- Database queries: Use Prisma Studio `npx prisma studio`

---

**Version:** 1.0.0  
**Last Updated:** January 21, 2026
