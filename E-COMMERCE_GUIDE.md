# E-Commerce Shopping Features Guide

This document outlines the complete e-commerce and shopping cart functionality added to BuildCalc Pro.

## 🛍️ Features Overview

The application now includes a comprehensive e-commerce system that allows users to:
- Browse and purchase construction materials
- Manage shopping cart with add/remove/update functionality
- Complete checkout with shipping information
- Track orders and order history
- View detailed order information

## 📁 New Components & Pages

### Pages
- `/shop` - Main shopping page with product catalog
- `/cart` - Shopping cart management
- `/checkout` - Checkout and order placement
- `/orders` - Order history and tracking

### Components
- `components/shop/shop-content.tsx` - Product browsing with filtering and search
- `components/cart/cart-content.tsx` - Shopping cart with quantity management
- `components/checkout/checkout-content.tsx` - Checkout form and order processing
- `components/orders/orders-content.tsx` - Order history display

## 🗄️ Database Schema

### New Models

#### Product
```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  description   String
  category      String   // cement, steel, wood, tools, equipment, pipes, wiring, paint, other
  price         Float
  currency      String   @default("USD")
  unit          String   // bag, ton, piece, meter, roll, etc.
  imageUrl      String?
  stock         Int      @default(0)
  brand         String?
  specifications String? // JSON stringified
  isActive      Boolean  @default(true)
  featured      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### CartItem
```prisma
model CartItem {
  id            String   @id @default(cuid())
  userId        String
  productId     String
  quantity      Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(...)
  product       Product  @relation(...)
  @@unique([userId, productId])
}
```

#### Order
```prisma
model Order {
  id              String   @id @default(cuid())
  userId          String
  orderNumber     String   @unique
  status          String   @default("pending") // pending, processing, shipped, delivered, cancelled
  totalAmount     Float
  currency        String   @default("USD")
  shippingAddress String   // JSON stringified
  shippingMethod  String   @default("standard")
  shippingCost    Float    @default(0)
  paymentMethod   String   @default("cash")
  paymentStatus   String   @default("pending")
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### OrderItem
```prisma
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  quantity    Int
  price       Float    // Price at time of order
  createdAt   DateTime @default(now())
}
```

## 🔌 API Routes

### Products API (`/api/products`)
- **GET** - Fetch all active products
- **POST** - Create new product (admin)

### Cart API (`/api/cart`)
- **GET** - Get user's cart items
- **POST** - Add product to cart
- **PATCH** - Update cart item quantity
- **DELETE** - Remove item from cart

### Cart Clear API (`/api/cart/clear`)
- **DELETE** - Clear all cart items

### Orders API (`/api/orders`)
- **GET** - Get user's order history
- **POST** - Create new order from cart

## 🎨 Design & Styling

The e-commerce features follow the existing design system:

### Color Scheme
- **Primary**: Warm coral/orange for CTAs and highlights
- **Secondary**: Navy blue for headers and important text
- **Background**: Warm cream
- **Border**: Navy blue borders (2px)

### Typography
- **Display Font**: Space Grotesk for headings
- **Body Font**: Inter for regular text

### Component Styling
- Cards with 2px borders
- Hover effects with shadow transitions
- Consistent button styling matching existing pages
- Responsive grid layouts
- Badge indicators for cart count and status

## 🌐 Internationalization (i18n)

All new features support English and French translations:

### English (`messages/en.json`)
```json
{
  "shop": { ... },
  "cart": { ... },
  "checkout": { ... },
  "orders": { ... }
}
```

### French (`messages/fr.json`)
```json
{
  "shop": { ... },
  "cart": { ... },
  "checkout": { ... },
  "orders": { ... }
}
```

## 🚀 Setup Instructions

### 1. Update Database Schema
```bash
npx prisma migrate dev --name add_ecommerce_features
npx prisma generate
```

### 2. Seed Sample Products
```bash
npx tsx prisma/seed-products.ts
```

This will create 15 sample products across categories:
- Cement (2 products)
- Steel (2 products)
- Wood (2 products)
- Tools (1 product)
- Equipment (2 products)
- Pipes (2 products)
- Wiring (1 product)
- Paint (1 product)
- Other (2 products)

### 3. Install Dependencies (if needed)
All required dependencies should already be installed. If you encounter issues:
```bash
pnpm install
```

### 4. Run Development Server
```bash
pnpm dev
```

## 📱 User Flow

### Shopping Flow
1. User visits `/shop` page
2. Browses products by category
3. Uses search and filters to find products
4. Clicks "Add to Cart" (requires authentication)
5. Cart badge updates in header

### Checkout Flow
1. User clicks cart icon or "View Cart"
2. Reviews items in `/cart`
3. Can update quantities or remove items
4. Clicks "Proceed to Checkout"
5. Fills shipping information at `/checkout`
6. Selects shipping method and payment method
7. Places order
8. Receives order confirmation with order number
9. Can view order in `/orders` page

## 🔐 Authentication

All shopping features require user authentication:
- Unauthenticated users are redirected to `/login`
- Cart is user-specific
- Orders are tied to user accounts

## 📊 Product Categories

- **cement** - Cement and concrete products
- **steel** - Steel, rebar, and reinforcement
- **wood** - Lumber, plywood, and wood products
- **tools** - Hand tools and power tools
- **equipment** - Construction equipment
- **pipes** - Plumbing pipes and fittings
- **wiring** - Electrical wiring and cables
- **paint** - Paint and finishing materials
- **other** - Other construction materials

## 💳 Payment Methods

Currently supported (placeholder implementation):
- Cash on Delivery
- Credit/Debit Card
- Bank Transfer

**Note**: Payment processing is not implemented. This is a UI demonstration. Integrate with payment providers (Stripe, PayPal, etc.) for production.

## 🚚 Shipping Methods

- **Standard** - 5-7 days (USD 50.00)
- **Express** - 2-3 days (USD 100.00)
- **Pickup** - Store pickup (Free)

## 📦 Order Status

- **pending** - Order placed, awaiting processing
- **processing** - Order being prepared
- **shipped** - Order dispatched
- **delivered** - Order delivered to customer
- **cancelled** - Order cancelled

## 🎯 Key Features

### Shopping Page
- ✅ Product grid with images
- ✅ Category filtering
- ✅ Search functionality
- ✅ Sort options (price, name, newest)
- ✅ Featured products section
- ✅ Stock indicators
- ✅ Brand badges
- ✅ Responsive design

### Shopping Cart
- ✅ Real-time cart updates
- ✅ Quantity adjustment with +/- buttons
- ✅ Remove individual items
- ✅ Clear entire cart
- ✅ Order summary with subtotal and shipping
- ✅ Empty cart state
- ✅ Cart badge in header with item count

### Checkout
- ✅ Shipping information form
- ✅ Multiple shipping methods
- ✅ Multiple payment methods
- ✅ Order summary display
- ✅ Form validation
- ✅ Order confirmation screen
- ✅ Automatic cart clearing after order

### Order History
- ✅ List all user orders
- ✅ Order status badges
- ✅ Order details modal
- ✅ Shipping address display
- ✅ Payment method and status
- ✅ Item list with quantities
- ✅ Empty state for no orders

## 🛠️ Customization

### Adding New Products

You can add products via API or directly in database:

```typescript
const product = await prisma.product.create({
  data: {
    name: "Product Name",
    description: "Product description",
    category: "cement", // or other category
    price: 99.99,
    currency: "USD",
    unit: "bag",
    stock: 100,
    brand: "Brand Name",
    featured: false,
    specifications: JSON.stringify({
      weight: "50kg",
      // ... other specs
    }),
  },
})
```

### Updating Prices

Products have a `price` field that can be updated:

```typescript
await prisma.product.update({
  where: { id: productId },
  data: { price: newPrice },
})
```

### Managing Stock

Stock is automatically decremented when orders are placed. You can manually update:

```typescript
await prisma.product.update({
  where: { id: productId },
  data: { stock: { increment: 100 } }, // Add stock
})
```

## 🔒 Security Considerations

- ✅ Authentication required for cart and orders
- ✅ User-specific cart isolation
- ✅ Order ownership validation
- ✅ SQL injection prevention (Prisma ORM)
- ⚠️ Admin routes need role-based access control
- ⚠️ Payment processing needs secure integration
- ⚠️ Input validation on all forms

## 📈 Future Enhancements

Potential improvements:
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Advanced filtering (price range, brands)
- [ ] Product image gallery
- [ ] Stock notifications
- [ ] Discount codes/coupons
- [ ] Order tracking with shipping updates
- [ ] Invoice generation
- [ ] Admin panel for product management
- [ ] Inventory management system
- [ ] Real payment gateway integration
- [ ] Multi-currency support
- [ ] Product variants (sizes, colors)
- [ ] Bulk ordering

## 🐛 Troubleshooting

### Cart not updating
- Check if user is authenticated
- Verify API routes are accessible
- Check browser console for errors

### Products not showing
- Run the seed script: `npx tsx prisma/seed-products.ts`
- Check database connection
- Verify products have `isActive: true`

### Order placement fails
- Ensure cart is not empty
- Verify all required form fields are filled
- Check payment and shipping method selection
- Review server logs for errors

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check the console for error messages
4. Verify database schema is up to date

## 🎉 Summary

The e-commerce features add a complete shopping experience to BuildCalc Pro, allowing users to:
- Browse and purchase construction materials
- Manage their shopping cart
- Complete checkout with shipping details
- Track their order history

All features are built with the existing design system, fully internationalized, and follow Next.js and React best practices.
