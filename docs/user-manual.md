# User Manual: Emiti Dagala - Trusted Herbal Marketplace

## Getting Started

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Edge 90+
- **Resolution**: 1024x768 minimum (1920x1080 recommended)

### Accessing the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Nginx Gateway | http://localhost:80 |

### Login Credentials (Seeded Data)

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@emitidagala.com | admin123 |
| **Vendor 1** | herbalife@emitidagala.com | vendor123 |
| **Vendor 2** | nature@emitidagala.com | vendor123 |
| **Vendor 3** | green@emitidagala.com | vendor123 |
| **Customer** | alice@example.com | customer123 |
| **Customer** | bob@example.com | customer123 |
| **Customer** | carol@example.com | customer123 |

---

## 1. Customer Interface

### 1.1 Browsing Products

1. Open http://localhost:5173 in your browser
2. The **Home** page displays featured herbal products
3. Use the **navigation bar** to browse by category
4. The **Search bar** at the top performs full-text search (e.g., "moringa", "immune")
5. Each product card shows:
   - Product image placeholder
   - Product name and price (UGX)
   - Average rating and review count
   - Vendor name

![Home Page](https://via.placeholder.com/800x400?text=Home+Page+Screenshot)

### 1.2 Product Details

1. Click any product card to view **Product Detail** page
2. See full description, ingredients, usage instructions, and warnings
3. View vendor information and store name
4. Set quantity and click **Add to Cart**

![Product Detail](https://via.placeholder.com/800x400?text=Product+Detail+Screenshot)

### 1.3 Cart & Checkout

1. Click the **Cart** icon in the navbar to view your cart
2. Adjust quantities or remove items
3. Click **Proceed to Checkout**
4. Enter or select your delivery address
5. Review order summary (subtotal, delivery fee, total)
6. Choose payment method (MTN Mobile Money)
7. Click **Place Order**

### 1.4 Registration

1. Click **Register** on the login page
2. Fill in your details (name, email, password)
3. Optionally check **Register as a Vendor** to create a vendor account
4. Click **Create Account**

---

## 2. Vendor Interface

### 2.1 Vendor Dashboard

1. Log in as a vendor (e.g., herbalife@emitidagala.com / vendor123)
2. Navigate to **Dashboard** in the sidebar
3. View key metrics:
   - **Total Sales** — Revenue from all orders
   - **Total Orders** — Number of orders received
   - **Average Rating** — Customer satisfaction score
   - **Pending Orders** — Orders awaiting processing

![Vendor Dashboard](https://via.placeholder.com/800x400?text=Vendor+Dashboard+Screenshot)

### 2.2 Product Management (Inventory)

1. Click **Inventory** or **Products** in the sidebar
2. View all your listed products in a table
3. Each row shows: Name, Price, Stock, Status, Sales, Rating
4. **Add Product**: Click "Add Product" button
   - Fill in name, description, price, stock quantity
   - Select a category
   - Upload product images (up to 5, 5MB each)
   - Set low stock threshold
   - Click **Save**
5. **Edit Product**: Click pencil icon on any product
6. **Delete Product**: Click trash icon (confirm dialog)

![Product Form](https://via.placeholder.com/800x400?text=Add+Product+Form+Screenshot)

### 2.3 Order Fulfillment

1. Click **Orders** in the sidebar
2. View incoming orders with status tracking
3. Order status flow: **Pending → Paid → Processing → Packed → Shipped → Delivered**
4. Click **Update Status** to advance orders
5. Add tracking number for shipped orders

### 2.4 Analytics

1. Click **Analytics** in the sidebar
2. View:
   - **Sales Chart** — Monthly revenue bar chart
   - **Top Products** — Best-selling items
   - **Order Trends** — Order volume over time
   - **Category Breakdown** — Product distribution

### 2.5 Payouts

1. Click **Payouts** in the sidebar
2. View payout history with amounts, commission, and net amount
3. Track pending vs paid payouts

### 2.6 Store Settings

1. Click **Store** in the sidebar
2. Update your store name, description, logo, banner
3. View your public store page URL

---

## 3. Admin Interface

### 3.1 Admin Dashboard

1. Log in as admin (admin@emitidagala.com / admin123)
2. Navigate to **Dashboard**
3. View platform-wide metrics:
   - **Total Revenue** — Platform earnings
   - **Total Vendors** — Registered vendors
   - **Total Products** — Approved products
   - **Total Orders** — All orders
   - **Pending Approvals** — New vendor/product requests

![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard+Screenshot)

### 3.2 Vendor Management

1. Click **Vendors** in the sidebar
2. View all vendors with status (Pending/Approved/Suspended)
3. **Approve** new vendor registrations
4. **Suspend** vendors violating policies
5. View each vendor's products, sales, and performance

### 3.3 Product Moderation

1. Click **Products** in the sidebar
2. Filter by status: Pending, Approved, Rejected, Suspended
3. **Approve** products after quality review
4. **Reject** products with reason
5. **Feature** products on the homepage

### 3.4 Order Management

1. Click **Orders** in the sidebar
2. View all platform orders across all vendors
3. Filter by status, date range, vendor
4. Handle refunds and cancellations

### 3.5 Payments & Reviews

1. **Payments** tab — View all payment transactions
2. **Reviews** tab — Moderate customer reviews (approve/hide)

### 3.6 Platform Settings

1. Click **Settings** in the sidebar
2. Configure:
   - Default commission rate (%)
   - Delivery fee
   - Free delivery threshold
   - Platform name and tagline

---

## 4. Navigation Summary

| Page | Route | Access |
|---|---|---|
| Home | `/` | Public |
| Products | `/products` | Public |
| Product Detail | `/products/:slug` | Public |
| Categories | `/categories` | Public |
| Cart | `/cart` | Customer |
| Checkout | `/checkout` | Customer |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Vendor Dashboard | `/vendor/dashboard` | Vendor |
| Vendor Inventory | `/vendor/products` | Vendor |
| Vendor Orders | `/vendor/orders` | Vendor |
| Admin Dashboard | `/admin/dashboard` | Admin |
| Admin Vendors | `/admin/vendors` | Admin |
| Admin Products | `/admin/products` | Admin |

---

## 5. Troubleshooting

| Issue | Solution |
|---|---|
| Cannot log in | Check credentials; ensure account is active |
| 500 error on pages | Ensure Docker containers are running (`docker compose ps`) |
| Products not loading | Verify DB is seeded (`docker compose exec backend node prisma/seed.js`) |
| Images not showing | Placeholder images are used; real images need upload |
| Payment fails | MTN MoMo is in sandbox mode; no real transactions occur |

---

*Emiti Dagala — Trusted Herbal Marketplace*
