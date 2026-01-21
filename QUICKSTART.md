# Quick Start Guide - BuildCalc Pro

## ⚡ Super Fast Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "+ Create new secret key"
3. Copy the key (starts with `sk-`)

### 3. Configure Environment
```bash
# Copy the example file
copy .env.local.example .env.local

# Edit .env.local and paste your OpenAI key
# OPENAI_API_KEY=sk-your-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 🎉

### 5. Test the App

1. Click "Start Estimating Free"
2. Select "Full House"
3. Enter dimensions: 12m x 10m x 3m
4. Select "United States - West Coast"
5. Choose "Standard" quality
6. Click "Calculate Materials"
7. View your estimate!

## What You Get

✅ **AI-Powered Pricing** - Location-based cost adjustments  
✅ **Industry-Standard Calculations** - Accurate material quantities  
✅ **Professional Reports** - Print/share estimates  
✅ **Multiple Project Types** - Houses, rooms, walls, roofs, etc.  
✅ **Quality Levels** - Basic, standard, premium materials  
✅ **Mobile Responsive** - Works on all devices  

## Features Overview

### For Contractors
- Instant material quantity calculations
- Cost estimates with waste buffer
- Professional PDF reports
- Share estimates with clients

### For Homeowners
- Plan renovation budgets
- Compare quality levels
- Understand material needs
- Get accurate cost ranges

### For Builders
- Multiple project type support
- Regional pricing adjustments
- Detailed material breakdowns
- Export capabilities

## Project Types Supported

1. **Full House** - Complete residential construction
2. **Single Room** - Room additions
3. **Wall** - Wall construction or fencing
4. **Roof/Roofing** - New roof or re-roofing
5. **Extension** - Home extensions
6. **Foundation** - Foundation/slab work
7. **Renovation** - Interior renovations

## AI Features

When OpenAI API key is configured:
- 🌍 Regional market analysis
- 📊 Dynamic price adjustments
- 💡 Seasonal buying recommendations
- 🔄 Material alternative suggestions

Without AI (fallback):
- ✓ Uses base regional multipliers
- ✓ Standard industry calculations
- ✓ All core features work

## Next Steps

### Deploy to Production
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

### Customize
- Update prices in `lib/calculations.ts`
- Modify regions in `components/estimator/estimator-form.tsx`
- Customize styling in `app/globals.css`
- Add your branding

### Add Features
- User authentication (NextAuth.js ready)
- Database integration (Prisma/Supabase)
- Payment processing (Stripe)
- Email estimates (Resend)

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Build errors?**
```bash
npm install
npm run build
```

**AI features not working?**
- Check your OpenAI API key in `.env.local`
- Ensure you have API credits
- Check browser console for errors
- App will fallback to base calculations

**Calculations seem wrong?**
- Review formulas in `lib/calculations.ts`
- Verify input units (meters)
- Check regional multipliers
- Material prices may need updating

## Support & Resources

- **Documentation**: See README.md
- **Deployment Guide**: See DEPLOYMENT.md
- **Issues**: Check TypeScript errors with `npm run type-check`
- **Build**: Test with `npm run build`

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## Production Checklist

Before going live:
- [ ] Add OpenAI API key
- [ ] Update `NEXT_PUBLIC_APP_URL` in `.env.local`
- [ ] Test all features locally
- [ ] Review and update material prices
- [ ] Customize branding/colors
- [ ] Test on mobile devices
- [ ] Set up analytics
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Set up custom domain (optional)

## Cost Breakdown

### Free Tier (Development)
- Vercel Hobby: FREE
- OpenAI API: ~$1-5/month for testing

### Production (Low Traffic)
- Vercel Pro: $20/month (optional)
- OpenAI API: ~$10-50/month
- Custom Domain: ~$12/year

### Scaling (High Traffic)
- Vercel: Pay per usage
- OpenAI: ~$100+/month
- Consider: Caching, rate limiting

## Tips for Success

1. **Start Free**: Use Vercel Hobby plan initially
2. **Monitor Usage**: Check OpenAI dashboard regularly
3. **Cache Responses**: Reduce AI API calls
4. **Update Prices**: Keep material costs current
5. **Gather Feedback**: Improve based on user input
6. **SEO**: Already configured, just deploy
7. **Marketing**: Share with contractor communities

## What Makes This Special

🎯 **Accurate**: Industry-standard formulas  
🤖 **Smart**: AI-powered regional pricing  
⚡ **Fast**: Instant calculations  
📱 **Mobile**: Responsive design  
🔒 **Reliable**: Fallbacks for stability  
🎨 **Professional**: Clean, modern UI  
📈 **Scalable**: Built on Next.js  
🌍 **Global**: Multi-region support  

---

**Ready to help contractors build better!** 🏗️

Need help? Review the full [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md)
