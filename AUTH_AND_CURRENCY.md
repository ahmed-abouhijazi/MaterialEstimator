# Authentication & Currency Features

## Overview
This document describes the authentication system and multi-currency support added to the BuildCalc Pro material estimator application.

## Features Implemented

### 1. Authentication System ✅
- **Technology**: NextAuth.js (Beta) with Prisma adapter
- **Database**: SQLite with Prisma ORM
- **Password Hashing**: bcryptjs (10 salt rounds)

#### Components Created:
- `app/login/page.tsx` - Login page with email/password form
- `app/signup/page.tsx` - Registration page with validation
- `lib/auth.config.ts` - NextAuth configuration
- `lib/auth.ts` - Auth handlers export
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API routes
- `app/api/auth/signup/route.ts` - User registration endpoint
- `middleware.ts` - Protected route middleware

#### Features:
- User registration with email validation
- Secure password hashing
- JWT session management
- Protected routes (dashboard requires authentication)
- Auto-redirect after login
- User menu in header with logout
- Session persistence across page refreshes

### 2. Multi-Currency Support ✅
- **Currencies Supported**: USD, EUR, GBP, CAD, AUD, MAD
- **Location Mapping**: Automatic currency selection based on location

#### Files Created:
- `lib/currency.ts` - Currency conversion and formatting utilities

#### Supported Locations & Currencies:
| Location | Currency | Symbol |
|----------|----------|--------|
| United States (all regions) | USD | $ |
| France | EUR | € |
| United Kingdom | GBP | £ |
| Canada | CAD | CA$ |
| Australia | AUD | A$ |
| Morocco | MAD | DH |

#### Features:
- `getCurrencyForLocation()` - Auto-detect currency from location
- `convertPrice()` - Convert between currencies (USD base)
- `formatCurrency()` - Format with proper symbols and locale
- Real-time conversion rates (configurable)

### 3. Database Integration ✅
- **ORM**: Prisma 5
- **Database**: SQLite (dev), PostgreSQL-ready for production
- **Migration**: Successfully migrated to schema v2

#### Database Models:
```prisma
User {
  id, email, password, name, estimates[]
}

Estimate {
  id, userId, projectName, location, currency,
  materials (JSON), totalCost, materialCost,
  laborCost, equipmentCost, contingency
}

Session, Account (NextAuth tables)
```

### 4. Estimate Saving ✅
- **API Endpoint**: `/api/estimates`
- **Methods**: GET (list), POST (create), DELETE (remove)

#### Components Updated:
- `components/estimator/results-display.tsx` - Added "Save to Dashboard" button
- `components/dashboard/dashboard-content.tsx` - Display saved estimates
- `app/api/estimates/route.ts` - CRUD operations for estimates

#### Features:
- Save estimate to database (authenticated users only)
- View all saved estimates in dashboard
- Delete estimates
- Display costs in original currency
- Auto-login prompt for unauthenticated users

### 5. Header Updates ✅
- `components/header.tsx` - Dynamic authentication UI

#### Features:
- Show "Sign In" / "Get Started" when logged out
- Show user menu with name/email when logged in
- Logout functionality
- Responsive mobile menu with auth state

### 6. Protected Routes ✅
- `middleware.ts` - Route protection

#### Protected Routes:
- `/dashboard` - Requires authentication
- Redirect to `/login` with callback URL
- Auto-redirect logged-in users away from auth pages

## Environment Variables Required

```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Authentication
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000

# AI (existing)
OPENAI_API_KEY=<your-key>
```

## Usage

### User Registration Flow:
1. Visit `/signup`
2. Enter name, email, password (min 6 chars)
3. Auto-login after registration
4. Redirect to `/dashboard`

### Creating & Saving Estimates:
1. Visit `/estimator`
2. Fill project details (location auto-selects currency)
3. View results at `/estimator/results`
4. Click "Save to Dashboard" (login required)
5. View saved estimates at `/dashboard`

### Currency Display:
- Estimates automatically use local currency based on location
- France → EUR (€)
- Morocco → MAD (DH)
- US → USD ($)
- UK → GBP (£)
- Canada → CAD (CA$)
- Australia → AUD (A$)

## Database Schema Migration

Migrations created:
1. `20260121180920_init` - Initial schema
2. `20260121181713_update_estimate_schema` - Simplified estimate model

To reset database:
```bash
npx prisma migrate reset
```

To generate Prisma Client:
```bash
npx prisma generate
```

## Testing Checklist

- [x] User can register with email/password
- [x] User can login with credentials
- [x] Protected routes redirect to login
- [x] User menu shows name/email
- [x] Logout works correctly
- [x] Estimates save to database
- [x] Dashboard displays saved estimates
- [x] Currency displays correctly per location
- [x] Delete estimate works
- [x] Session persists across page reloads

## Production Deployment Notes

1. **Database**: Switch from SQLite to PostgreSQL
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Environment Variables**: Add to Vercel/hosting platform:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate new for production)
   - `NEXTAUTH_URL` (your production URL)
   - `OPENAI_API_KEY`

## Security Considerations

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT sessions (httpOnly cookies)
- ✅ CSRF protection via NextAuth
- ✅ Protected API routes (session validation)
- ✅ Input validation with Zod
- ✅ SQL injection protected (Prisma ORM)

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Real-time currency API integration
- [ ] Estimate sharing (public links)
- [ ] Estimate PDF export (save to account)
- [ ] Team/organization support
- [ ] Estimate templates
- [ ] Advanced currency settings (custom rates)

## Support

For issues or questions:
- Check `prisma/schema.prisma` for database structure
- Review `lib/auth.config.ts` for auth configuration
- See `lib/currency.ts` for currency conversion logic
- Check browser console for client-side errors
- Check terminal for server-side errors

## Version

- **Authentication**: v1.0 (NextAuth Beta + Prisma 5)
- **Currency**: v1.0 (6 currencies supported)
- **Database**: Prisma 5 + SQLite (dev) / PostgreSQL (prod)
- **Last Updated**: January 21, 2026
