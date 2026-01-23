# E-Commerce Quick Setup Script
# Run this script after pulling the e-commerce features

Write-Host "🛍️ Setting up E-Commerce Features..." -ForegroundColor Cyan

# 1. Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# 2. Run database migrations
Write-Host "`n🗄️ Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name add_ecommerce_features

# 3. Generate Prisma Client
Write-Host "`n⚙️ Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 4. Seed sample products
Write-Host "`n🌱 Seeding sample products..." -ForegroundColor Yellow
npx tsx prisma/seed-products.ts

Write-Host "`n✅ E-Commerce setup complete!" -ForegroundColor Green
Write-Host "`nYou can now:" -ForegroundColor White
Write-Host "  • Visit /shop to browse products" -ForegroundColor Gray
Write-Host "  • Visit /cart to manage your cart" -ForegroundColor Gray
Write-Host "  • Visit /checkout to place orders" -ForegroundColor Gray
Write-Host "  • Visit /orders to view order history" -ForegroundColor Gray
Write-Host "`nRun: pnpm dev" -ForegroundColor Cyan
