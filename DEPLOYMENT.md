# 🚀 BuildCalc Pro - Complete Deployment Guide

## Step 1: Prerequisites

Before deploying, ensure you have:
- [ ] OpenAI API key (get it from https://platform.openai.com/api-keys)
- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] pnpm installed (`npm install -g pnpm`)

## Step 2: Initial Setup

1. **Install dependencies**:
```bash
cd material-estimator-app
pnpm install
```

2. **Configure environment variables**:
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Test locally**:
```bash
pnpm dev
```

Visit http://localhost:3000 and test the following:
- [ ] Homepage loads correctly
- [ ] Navigate to /estimator
- [ ] Fill out the form (try: House, 12m x 10m x 3m, US West Coast, Standard)
- [ ] Click "Calculate Materials"
- [ ] View results page
- [ ] Test print/share functionality

## Step 3: Push to GitHub

1. **Initialize git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - BuildCalc Pro ready for deployment"
```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Name: `buildcalc-pro` or your preferred name
   - Don't initialize with README (we have one)
   - Click "Create repository"

3. **Push code**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/buildcalc-pro.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Select your `buildcalc-pro` repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `pnpm install` (auto-detected)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   **Production:**
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

   **Optional (for future features):**
   ```
   NEXTAUTH_SECRET=generate-a-random-string-here
   NEXTAUTH_URL=https://your-domain.vercel.app
   DATABASE_URL=your-database-url-if-using-database
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Click on the deployment URL to view your live site

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Your account
# - Link to existing project: N
# - Project name: buildcalc-pro
# - Directory: ./
# - Override settings: N
```

## Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Step 6: Testing Production Deployment

Test all features in production:

1. **Homepage** (`/`):
   - [ ] Hero section displays
   - [ ] Features section loads
   - [ ] All navigation links work

2. **Estimator** (`/estimator`):
   - [ ] Form validation works
   - [ ] All project types selectable
   - [ ] Calculation completes
   - [ ] Results display correctly

3. **Results** (`/estimator/results`):
   - [ ] Materials list organized by category
   - [ ] Prices calculated correctly
   - [ ] Print functionality works
   - [ ] Share button works

4. **AI Features**:
   - [ ] Location-based pricing adjusts correctly
   - [ ] Different regions show different prices
   - [ ] Fallback works if AI unavailable

## Step 7: Monitoring & Analytics

1. **Vercel Analytics**:
   - Already integrated with `@vercel/analytics`
   - View in Vercel dashboard → Analytics

2. **Error Tracking**:
   - Check Vercel dashboard → Logs
   - Monitor API errors
   - Review build logs

3. **Performance**:
   - Use Vercel Speed Insights
   - Check Core Web Vitals
   - Monitor API response times

## Step 8: Ongoing Maintenance

### Update Prices Regularly

Edit `lib/calculations.ts` to update material prices:
```typescript
const basePrices: Record<string, Record<QualityLevel, number>> = {
  cement: { basic: 8, standard: 10, premium: 14 }, // Update these
  sand: { basic: 25, standard: 30, premium: 40 },
  // ... update other prices
}
```

### Monitor API Usage

- Track OpenAI API usage in OpenAI dashboard
- Set spending limits to avoid unexpected charges
- Consider caching AI responses for common queries

### Regular Deployments

```bash
# Make changes
git add .
git commit -m "Description of changes"
git push origin main

# Vercel will auto-deploy
```

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- Solution: Run `pnpm install` locally and push `pnpm-lock.yaml`

**Error**: "Environment variable not found"
- Solution: Check Vercel → Project Settings → Environment Variables

### AI Features Not Working

**Issue**: Prices don't adjust by location
- Check: OpenAI API key is set correctly
- Check: API key has sufficient credits
- Check: Vercel logs for API errors

**Fallback**: App will use base multipliers if AI fails

### Slow Performance

- Enable Vercel Edge Functions for faster API responses
- Implement caching for AI responses
- Optimize images in `/public`

### API Rate Limits

- Implement rate limiting (use Vercel KV or Redis)
- Cache AI responses with TTL
- Consider upgrading OpenAI plan

## Cost Estimates

### Vercel (Free tier suitable for MVP)
- **Hobby**: FREE
  - 100GB bandwidth
  - Serverless functions
  - Automatic HTTPS
  - 6000 function invocations/day

- **Pro**: $20/month (when scaling)
  - Unlimited bandwidth
  - Advanced analytics
  - Team collaboration

### OpenAI API
- GPT-3.5-Turbo: ~$0.002 per 1000 tokens
- Estimated cost per calculation: $0.001-0.003
- 1000 calculations: ~$1-3
- Cache responses to reduce costs

## Security Checklist

- [ ] `.env.local` added to `.gitignore`
- [ ] API keys stored in Vercel environment variables
- [ ] Rate limiting configured (future enhancement)
- [ ] Input validation on all forms
- [ ] API routes protected with try-catch
- [ ] CORS configured if needed

## Next Steps

After successful deployment:

1. **Add Custom Features**:
   - User authentication (NextAuth.js)
   - Database for saving estimates (Vercel Postgres or Supabase)
   - Payment integration (Stripe) for premium features
   - Email estimates (Resend or SendGrid)

2. **Marketing**:
   - Submit to product directories
   - Create social media accounts
   - SEO optimization (already configured)
   - Content marketing

3. **Gather Feedback**:
   - Add feedback form
   - Monitor analytics
   - Iterate based on user behavior

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console for client errors
3. Test API endpoints directly
4. Review this guide again

## Success Criteria

✅ Site loads at your Vercel URL  
✅ Estimator form works correctly  
✅ Calculations complete successfully  
✅ AI pricing adjustments apply  
✅ Print/share features work  
✅ Mobile responsive  
✅ Fast performance (<2s load time)  

## 🎉 Congratulations!

Your BuildCalc Pro app is now live and fully functional!

Share your deployment URL and start helping contractors estimate their projects!
