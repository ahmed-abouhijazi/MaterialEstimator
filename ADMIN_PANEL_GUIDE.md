# 🎯 Admin Panel - BuildCalc Pro

Complete admin panel integrated into your MaterialEstimator app with real database connection!

## ✅ What's Been Added

### 1. Admin Routes (`/admin`)
- **Dashboard** - Overview with stats, charts, recent orders
- **Orders** - View and manage all orders
- **Inventory** - Product management and stock tracking
- **Users** - User management
- **Analytics** - Sales and performance analytics
- **Settings** - System configuration

### 2. Database Updates
- ✅ Added `role` field to User model (ADMIN, MANAGER, STAFF, CUSTOMER)
- ✅ Added `isActive` field for account management
- ✅ Added `sku`, `barcode`, `minStock`, `maxStock` to Product model
- ✅ Migration applied successfully

### 3. Authentication System
- ✅ JWT-based authentication with HTTP-only cookies
- ✅ Role-based access control
- ✅ Secure admin login at `/admin/login`
- ✅ Auto-redirect for unauthorized access

### 4. API Endpoints Created

**Auth**:
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Logout
- `GET /api/admin/auth/me` - Get current admin user

**Dashboard**:
- `GET /api/admin/dashboard` - Get stats, revenue data, top products

**Orders**:
- `GET /api/admin/orders` - List orders with pagination
- `PATCH /api/admin/orders` - Update order status

**Products**:
- `GET /api/admin/products` - List products with filters
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products` - Update product
- `DELETE /api/admin/products` - Soft delete product

## 🔐 Admin Login Credentials

### Default Admin Account
```
Email: admin@buildcalc.pro
Password: admin123
```

**⚠️ IMPORTANT**: Change the password immediately after first login!

## 🚀 Access the Admin Panel

### Local Development
1. Make sure the server is running:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/admin/login

3. Login with credentials above

### Production (Vercel)
1. Visit: https://material-estimator-lilac.vercel.app/admin/login

2. Login with admin credentials

## 🛠️ Create Additional Admin Users

Run the script to create/update admin users:

```bash
node scripts/create-admin.mjs
```

Or manually using Prisma Studio:
```bash
npx prisma studio
```

Then update any user's `role` field to `ADMIN`, `MANAGER`, or `STAFF`.

## 📊 Features Overview

### Dashboard
- 📈 Revenue tracking with month-over-month comparison
- 🛒 Order statistics
- 📦 Product inventory count
- 👥 Customer statistics
- 📉 Revenue chart (last 6 months)
- 🏆 Top 5 products by revenue
- ⚠️ Low stock alerts
- 📋 Recent orders table

### Orders Management
- View all orders with pagination
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Update order status
- Update payment status
- View order details and items
- Customer information

### Inventory Management
- Product listing with search and filters
- Low stock alerts
- Add new products
- Edit product details
- Update stock levels
- Set min/max stock thresholds
- Manage SKU and barcodes
- Product categories

### User Management
- View all customers
- User activity tracking
- Subscription status
- Account activation/deactivation
- User role management

## 🎨 Design

The admin panel features a modern dark theme with:
- **Colors**: Slate (dark) + Amber (accent)
- **Layout**: Responsive sidebar navigation
- **Components**: Charts, tables, cards, badges
- **Mobile**: Fully responsive with hamburger menu

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **HTTP-Only Cookies**: Prevents XSS attacks
3. **Role-Based Access**: Different permissions for ADMIN/MANAGER/STAFF
4. **Password Hashing**: bcrypt with salt rounds
5. **Route Protection**: Middleware guards all admin routes
6. **API Validation**: All endpoints check authentication + authorization

## 🌍 Environment Variables

Already configured in Vercel:
```env
NEXTAUTH_SECRET="your-secret"
DATABASE_URL="your-db-url"
```

## 📱 Mobile Responsive

The admin panel is fully responsive:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu with overlay

## 🎯 Role Permissions

| Feature | CUSTOMER | STAFF | MANAGER | ADMIN |
|---------|----------|-------|---------|-------|
| Dashboard | ❌ | ✅ | ✅ | ✅ |
| View Orders | ❌ | ✅ | ✅ | ✅ |
| Update Orders | ❌ | ✅ | ✅ | ✅ |
| View Products | ❌ | ✅ | ✅ | ✅ |
| Edit Products | ❌ | ❌ | ✅ | ✅ |
| Delete Products | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ | ✅ |
| Settings | ❌ | ❌ | ❌ | ✅ |

## 🐛 Troubleshooting

### Can't Login?
1. Check if admin user exists in database
2. Run: `node scripts/create-admin.mjs`
3. Verify NEXTAUTH_SECRET is set in .env.local

### Database Errors?
1. Check DATABASE_URL in .env.local
2. Run migrations: `npx prisma migrate dev`
3. Generate client: `npx prisma generate`

### Not Authorized?
1. Check cookie settings (must allow third-party cookies in dev)
2. Clear browser cookies
3. Try incognito mode

## 🔄 Development Workflow

1. **Local Development**:
   ```bash
   npm run dev
   ```
   Admin: http://localhost:3000/admin

2. **Database Changes**:
   ```bash
   npx prisma migrate dev --name description
   npx prisma generate
   ```

3. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Admin updates"
   git push origin main
   ```
   Auto-deploys to production!

## 📚 Next Steps

### Recommended Enhancements
1. **Email Notifications**: Send emails on order status changes
2. **Export Data**: CSV/PDF export for reports
3. **Advanced Analytics**: More charts and insights
4. **Bulk Actions**: Mass update orders/products
5. **Activity Log**: Track admin actions
6. **2FA Authentication**: Add two-factor auth for admins
7. **API Documentation**: Swagger/OpenAPI docs
8. **Webhooks**: Integrate with external services

### Future Features
- Real-time notifications (WebSocket)
- Advanced search and filters
- Drag-and-drop product images
- Inventory forecasting
- Customer messaging system
- Automated reports
- Multi-language admin interface

## 📝 API Documentation

### Authentication
All admin API endpoints require authentication. Include the `admin-token` cookie with requests.

### Response Format
```json
{
  "success": true,
  "data": {...},
  "error": null
}
```

### Error Codes
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

## 🎉 Success!

Your admin panel is now live and fully integrated with your database!

**Admin URL**: https://material-estimator-lilac.vercel.app/admin
**Login**: admin@buildcalc.pro / admin123

**🔒 Remember to change the default password!**
