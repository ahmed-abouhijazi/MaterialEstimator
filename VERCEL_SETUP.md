# Vercel Deployment Setup

## Required Environment Variables

Add these to your Vercel project settings:

### 1. Database (PostgreSQL on Vercel)

```bash
# Go to Vercel Dashboard → Your Project → Storage → Create Database → Postgres
# After creating, Vercel will automatically add these variables:
POSTGRES_URL
POSTGRES_PRISMA_URL  # Use this as DATABASE_URL
POSTGRES_URL_NON_POOLING
```

**Then set:**
```
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

### 2. Authentication

```
NEXTAUTH_SECRET=bElFGsryqDNYHm3f80kKzw96jxVAgvtoMeOPICTUZhJQWX7S1dLnpBciR542au
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### 3. OpenAI (Already Set)

```
OPENAI_API_KEY=<your-openai-api-key>
```

**Note:** Use the same API key you configured earlier in Vercel dashboard.

## Steps to Deploy

### Option 1: Use Vercel Dashboard (Recommended)

1. **Create PostgreSQL Database:**
   - Go to: https://vercel.com/dashboard
   - Select your project: MaterialEstimator
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose region (same as your project)
   - Click "Create"
   - Vercel will auto-add DATABASE_URL to your environment variables

2. **Add Authentication Variables:**
   - Go to: Settings → Environment Variables
   - Add `NEXTAUTH_SECRET`: `bElFGsryqDNYHm3f80kKzw96jxVAgvtoMeOPICTUZhJQWX7S1dLnpBciR542au`
   - Add `NEXTAUTH_URL`: `https://your-actual-domain.vercel.app`

3. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - OR push a new commit (deployment happens automatically)

### Option 2: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add database (creates Postgres and sets DATABASE_URL automatically)
vercel postgres create

# Add environment variables
vercel env add NEXTAUTH_SECRET
# Paste: bElFGsryqDNYHm3f80kKzw96jxVAgvtoMeOPICTUZhJQWX7S1dLnpBciR542au

vercel env add NEXTAUTH_URL
# Paste: https://your-app-name.vercel.app

# Deploy
vercel --prod
```

## Database Migration

After database is created, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# OR use the Vercel Postgres dashboard SQL editor
# Run the SQL from: prisma/migrations/*/migration.sql
```

## Verify Deployment

1. Visit your app: `https://your-app-name.vercel.app`
2. Test signup: `/signup`
3. Create estimate and save
4. Check dashboard: `/dashboard`

## Troubleshooting

### Build Fails - "DATABASE_URL not found"
- Ensure PostgreSQL database is created in Vercel Storage
- Check Environment Variables are set for Production

### "Invalid session" or auth errors
- Verify NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain (no trailing slash)
- Redeploy after adding variables

### Database connection errors
- Check DATABASE_URL format: `postgresql://...`
- Verify Prisma migrations ran successfully
- Try regenerating Prisma Client in build

## Current Status

✅ Code pushed to GitHub: ahmed-abouhijazi/MaterialEstimator
✅ Commit: 341a5da
⏳ Auto-deployment triggered on Vercel
📝 Next: Add PostgreSQL database + environment variables

## Production Environment Variables Checklist

- [ ] Create Vercel Postgres database
- [ ] DATABASE_URL (auto-added by Vercel)
- [ ] NEXTAUTH_SECRET = bElFGsryqDNYHm3f80kKzw96jxVAgvtoMeOPICTUZhJQWX7S1dLnpBciR542au
- [ ] NEXTAUTH_URL = https://your-actual-domain.vercel.app
- [ ] OPENAI_API_KEY (already set from previous deployment)
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Test estimate saving

## Quick Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Open project in browser
vercel open

# View environment variables
vercel env ls
```

---

**Note:** The deployment will auto-trigger from GitHub push, but it needs the database and environment variables to work properly.
