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
| **Vendor 1** | spices@emitidagala.com | vendor123 |
| **Vendor 2** | grains@emitidagala.com | vendor123 |
| **Vendor 3** | herbal@emitidagala.com | vendor123 |
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
6. **Product Quick View** — Click any product card to open a glass modal showing:
   - Product images with dot navigation
   - Discount percentage badge
   - Full pricing (with strikethrough for discounts)
   - Stock status and available units
   - Short description and ingredients
   - Weight and vendor info
   - "View Full Details" button to navigate to the full product page

*[Screenshot: Home page showing featured herbal products, category navigation, and search bar]*

### 1.2 Product Details

1. Click any product card (or "View Full Details" from the quick view) to view **Product Detail** page
2. See full description, ingredients, usage instructions, warnings, contraindications, and side effects
3. View product metadata: SKU, weight, manufacturer, country of origin, registration & batch numbers, manufacturing date, stock quantity
4. View vendor information and store name
5. Set quantity and click **Add to Cart**

*[Screenshot: Product detail page with full description, images, reviews, and Add to Cart button]*

### 1.3 Cart & Checkout

1. Click the **Cart** icon in the navbar to view your cart
2. Adjust quantities or remove items
3. Click **Proceed to Checkout**
4. Enter or select your delivery address
5. Review order summary (subtotal, delivery fee, total)
6. Choose a payment method:
   - **MTN Mobile Money** — Enter your MTN phone number to pay via MoMo
   - **Airtel Money** — Enter your Airtel phone number to pay via Airtel Money
   - **Visa Card** — Enter card number, expiry, and CVV
   - **Apple Pay** — Follow the Apple Pay instructions on screen
7. Click **Place Order**

### 1.4 Submitting Reviews

1. View a **Product Detail** page
2. Scroll to the **Reviews** section
3. Select a rating (1–5 stars)
4. Write your review comment
5. Click **Submit Review**
6. Reviews are visible immediately after admin moderation approval

### 1.5 Registration

1. Click **Register** on the login page
2. Fill in your details (name, email, password)
3. Optionally check **Register as a Vendor** to create a vendor account
4. Click **Create Account**

---

## 2. Vendor Interface

### 2.1 Vendor Dashboard

1. Log in as a vendor (e.g., spices@emitidagala.com / vendor123)
2. Navigate to **Dashboard** in the sidebar
3. View key metrics:
   - **Total Sales** — Revenue from all orders
   - **Total Orders** — Number of orders received
   - **Average Rating** — Customer satisfaction score
   - **Pending Orders** — Orders awaiting processing

*[Screenshot: Vendor dashboard showing Total Sales, Total Orders, Average Rating, Pending Orders stat cards]*

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

*[Screenshot: Add Product form with fields for name, description, price, stock, category, and image upload]*

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

### 2.6 Public Store Page

Each vendor has a public storefront page visible to all visitors:

1. **URL**: `/vendor/{store-slug}` (e.g., `/vendor/nakasero-spice-house`)
2. The page displays:
   - **Hero banner** — Colorful gradient header with store logo, name, and verification badge
   - **About section** — Store history and mission story
   - **Specialties** — Highlighted products as clickable tags
   - **Contact info** — Phone number (clickable), email (clickable), physical address
   - **Hours** — Operating hours
   - **Products grid** — All approved products from the vendor

These pages are public and do not require login to browse.

### 2.7 Store Settings

1. Click **Store** in the sidebar
2. Update your store name, description, logo, banner
3. View your public store page URL

### 2.8 Product Images & Uploads

- Product images are stored in the `uploads/products/` directory at the project root
- For local development, place image files directly in `uploads/products/` matching the product image URLs in the database
- The **SafeImage** component prevents broken image icons — if an image file is missing, a fallback placeholder icon is shown instead
- Image files are served through the backend at `/api/uploads/products/` and proxied through Vite during development

---

## 3. Admin Interface

### 3.1 Admin Dashboard

1. Log in as admin (admin@emitidagala.com / admin123)
2. Navigate to **Dashboard**
3. View platform-wide metrics in **7 stat cards**:
   - **Total Customers** — Registered customer accounts
   - **Total Vendors** — All registered vendors
   - **Active Vendors** — Vendors with APPROVED status
   - **Total Products** — Approved and listed products
   - **Total Orders** — All orders across the platform
   - **Total Revenue** — Platform earnings from delivered orders
   - **Total Commission** — Platform commission collected
4. **Top Products** section — 10 best-selling products ranked by sales, with vendor name and revenue
5. **Top Vendors** section — 10 top-earning vendors with product/order counts

*[Screenshot: Admin dashboard with 7 stat cards (Customers, Vendors, Products, Orders, Revenue, Commission) and top products/vendors tables]*

### 3.2 Vendor Management

1. Click **Vendors** in the sidebar
2. View summary cards: Total Vendors, Approved, Pending
3. View all vendors in a table with columns:
   - **Store** — Name, owner name, link to public store page
   - **Contact** — Email and phone
   - **Products** — Product count
   - **Orders** — Order count
   - **Commission** — Click to edit commission rate (%)
   - **Status** — Pending / Approved / Suspended badge
   - **Actions** — Approve or Suspend vendors
4. Click **Approve** to activate a pending/suspended vendor
5. Click **Suspend** to deactivate an approved vendor
6. Click the commission rate to edit it inline

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
2. The settings page has **6 tabbed sections**:
   - **General** — Platform name, tagline, contact email, maintenance mode
   - **Payments** — Toggle payment methods on/off (MTN, Airtel, Visa, Apple Pay)
   - **Delivery** — Delivery fee, free delivery threshold, estimated delivery days
   - **Social** — Social media links (Facebook, Twitter, Instagram)
   - **SEO** — Meta title, description, Google Analytics ID
   - **Advanced** — Default commission rate, minimum payout threshold

---

## 4. Navigation Summary

| Page | Route | Access |
|---|---|---|---|
| Home | `/` | Public |
| Products | `/products` | Public |
| Product Detail | `/product/:slug` | Public |
| Vendors | `/vendors` | Public |
| Vendor Detail | `/vendor/:slug` | Public |
| Categories | `/categories` | Public |
| Search | `/search?q=` | Public |
| Cart | `/cart` | All |
| Checkout | `/checkout` | Customer+ |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Customer Dashboard | `/dashboard` | Customer |
| Customer Orders | `/dashboard/orders` | Customer |
| Customer Wishlist | `/dashboard/wishlist` | Customer |
| Customer Profile | `/dashboard/profile` | All |
| Vendor Dashboard | `/vendor/dashboard` | Vendor |
| Vendor Products | `/vendor/products` | Vendor |
| Vendor Orders | `/vendor/orders` | Vendor |
| Vendor Analytics | `/vendor/analytics` | Vendor |
| Vendor Payouts | `/vendor/payouts` | Vendor |
| Vendor Inventory | `/vendor/inventory` | Vendor |
| Vendor Store Settings | `/vendor/store` | Vendor |
| Admin Dashboard | `/admin/dashboard` | Admin |
| Admin Vendors | `/admin/vendors` | Admin |
| Admin Products | `/admin/products` | Admin |
| Admin Orders | `/admin/orders` | Admin |
| Admin Payments | `/admin/payments` | Admin |
| Admin Settings | `/admin/settings` | Admin |
| Admin Reviews | `/admin/reviews` | Admin |

---

## 5. Troubleshooting

| Issue | Solution |
|---|---|---|
| Cannot log in | Check credentials; ensure account is active |
| 500 error on pages | Ensure Docker containers are running (`docker compose ps`) |
| Products not loading | Verify DB is seeded (`docker compose exec backend node prisma/seed.js`) |
| Images not showing placeholder | The **SafeImage** component gracefully handles missing files by showing a fallback icon (🌿). Upload actual image files to `uploads/products/` via the vendor dashboard. |
| Payment fails | All payment methods are in sandbox/test mode; no real transactions occur |
| Docker proxy errors | If Vite returns 500 on API/upload requests, ensure `VITE_API_PROXY_TARGET` is set to `http://backend:3000` in docker-compose.yml for the frontend service |

---

*Emiti Dagala — Trusted Herbal Marketplace*
