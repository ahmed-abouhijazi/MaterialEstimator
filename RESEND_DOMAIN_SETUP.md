# Resend Email Domain Setup Guide

## The Issue

The default `resend.dev` domain is for testing only and can **only send emails to your Resend account email address**. To send verification emails to your users, you need to verify a custom domain.

## Solution: Verify a Custom Domain

### Step 1: Access Resend Dashboard

1. Go to [https://resend.com/domains](https://resend.com/domains)
2. Log in to your Resend account
3. Click **"Add Domain"**

### Step 2: Add Your Domain

Choose one of these options:

#### Option A: Use a Subdomain (Recommended)
- Add a subdomain like: `mail.yourdomain.com` or `email.yourdomain.com`
- This keeps your main domain clean and organized

#### Option B: Use Your Root Domain
- Add your main domain: `yourdomain.com`
- Works well for smaller projects

### Step 3: Add DNS Records

Resend will provide you with DNS records to add to your domain registrar:

**Required DNS Records:**
```
Type: TXT
Name: @ (or your subdomain)
Value: [Provided by Resend]

Type: MX
Name: @ (or your subdomain)
Priority: 10
Value: [Provided by Resend]

Type: TXT (DKIM)
Name: resend._domainkey
Value: [Provided by Resend]
```

**Where to add DNS records:**
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → Domains → DNS
- **Cloudflare**: Select Domain → DNS → Records
- **Vercel**: Your Domain → DNS Records

### Step 4: Wait for Verification

- DNS propagation takes **5-60 minutes** (sometimes up to 24 hours)
- Resend will automatically verify once DNS records are detected
- You'll receive an email confirmation

### Step 5: Update Your Environment Variables

Once verified, add this to your `.env.local`:

```env
RESEND_FROM_EMAIL="BuildCalc Pro <onboarding@yourdomain.com>"
```

**Important**: Replace `yourdomain.com` with your actual verified domain!

### Step 6: Deploy to Production

1. Add the environment variable to Vercel:
   ```bash
   vercel env add RESEND_FROM_EMAIL
   ```
   Enter: `BuildCalc Pro <onboarding@yourdomain.com>`

2. Or add it via Vercel Dashboard:
   - Go to: Project → Settings → Environment Variables
   - Add: `RESEND_FROM_EMAIL` = `BuildCalc Pro <onboarding@yourdomain.com>`

3. Redeploy your application

## Quick Setup (If You Don't Have a Domain)

### Option 1: Use a Free Subdomain
- Get a free domain from [Freenom](https://www.freenom.com)
- Or use a subdomain from services like:
  - [Netlify](https://www.netlify.com)
  - [Vercel](https://vercel.com) (yourapp.vercel.app)

### Option 2: Testing Mode (Development Only)
Keep using `resend.dev` but **only for your own email**:
- Sign up with the email you want to test with
- Emails will only work for YOUR account email
- Not suitable for production!

## Verification Checklist

✅ Domain added to Resend Dashboard  
✅ DNS records added to domain registrar  
✅ Wait 5-60 minutes for DNS propagation  
✅ Domain shows "Verified" in Resend  
✅ `RESEND_FROM_EMAIL` environment variable added  
✅ Application redeployed  
✅ Test email sent successfully  

## Troubleshooting

### DNS Records Not Verifying
- Wait longer (up to 24 hours)
- Check DNS propagation: [https://dnschecker.org](https://dnschecker.org)
- Ensure records are added to the **root** domain, not a subdomain (unless using subdomain)

### Still Getting "Testing Domain" Error
- Verify the domain shows "Verified" in Resend dashboard
- Ensure `RESEND_FROM_EMAIL` uses the verified domain
- Restart your application after adding env variable
- Clear application cache

### Emails Going to Spam
- Add SPF, DKIM, and DMARC records (Resend provides these)
- Warm up your domain by sending gradually
- Avoid spammy words in subject lines
- Include unsubscribe links for marketing emails

## Recommended Email Addresses

✅ `onboarding@yourdomain.com` - For verification emails  
✅ `noreply@yourdomain.com` - For automated notifications  
✅ `support@yourdomain.com` - For support communications  
✅ `hello@yourdomain.com` - For general communications  

## Cost

- **Resend Free Tier**: 3,000 emails/month, 100 emails/day
- **Additional emails**: $20/month for 50,000 emails
- **Domain verification**: FREE

## Need Help?

- Resend Documentation: [https://resend.com/docs](https://resend.com/docs)
- Resend Support: support@resend.com
- DNS Help: Contact your domain registrar

---

**After setup, your verification emails will work for all users! 🎉**
