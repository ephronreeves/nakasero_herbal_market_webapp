# Emiti Dagala — Technical Document

**Project:** Emiti Dagala (Nakasero Herbal Market)
**Version:** 1.0.0
**Stack:** React 18 + Node.js/Express 4 + Prisma ORM 5 + PostgreSQL 16 + Redis 7
**Deployment:** Docker + Docker Compose

---

## 1. Problem Statement

Access to authentic herbal medicine and natural health products in Uganda is fragmented across informal markets, individual sellers, and unverified roadside vendors. Buyers face three core challenges:

- **Trust deficit** — no mechanism to verify product quality, authenticity, or vendor credentials
- **Price opacity** — no way to compare prices across vendors or evaluate cost-to-quality ratios
- **Discovery gap** — vendors lack digital storefronts; customers cannot search, browse, or filter products systematically

Sellers lack affordable digital infrastructure to manage inventory, process payments, or reach customers beyond their physical market location.

Emiti Dagala ("Herbal Garden" in Luganda) solves this by providing a trusted multi-vendor e-commerce marketplace where verified herbal vendors list products with full traceability metadata, manage inventory, and process payments through mobile money and card gateways — while customers browse, search, review, and purchase with confidence.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F1 | JWT-based registration and authentication | High |
| F2 | Role-based access control: Admin, Vendor, Customer | High |
| F3 | Vendor storefront management (product CRUD with bulk images) | High |
| F4 | Hierarchical category browsing | High |
| F5 | Shopping cart → checkout → order pipeline | High |
| F6 | Order lifecycle tracking (PENDING → DELIVERED) with status validation | High |
| F7 | Multi-provider payments (MTN MoMo, Airtel Money, Visa, Apple Pay) | High |
| F8 | Full-text product search with suggestions | Medium |
| F9 | Product reviews and ratings with admin moderation | Medium |
| F10 | Vendor payout management (commission-based) | Medium |
| F11 | Admin analytics dashboard (7 stat cards, top products, top vendors) | Medium |
| F12 | Low-stock alerts and expiry tracking | Low |
| F13 | Audit logging for all CRUD operations | Low |
| F14 | Wishlist management | Low |
| F15 | Platform settings management (commission, delivery, SEO, payment toggles) | Low |

### 2.2 Non-Functional Requirements

| ID | Requirement | Implementation |
|---|---|---|
| N1 | Stateless API for horizontal scalability | JWT tokens, no server-side sessions |
| N2 | API response <500ms for reads | Redis caching, Prisma connection pooling, composite indexes |
| N3 | Payment data isolation | Payment provider data stored as JSON, no raw credentials |
| N4 | Containerized deployment | Docker Compose with 5 services |
| N5 | Data integrity | Foreign keys, unique constraints, `@@unique` on compound keys |
| N6 | Rate limiting | 100 requests per 15-minute window per IP |
| N7 | Security headers | Helmet middleware (XSS, CSP, HSTS) |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
Browser ──▶ Nginx (80/443)
              ├── /api/* ──▶ Backend (Express :3000)
              │                ├── Middleware stack (helmet, cors, rate-limit)
              │                ├── Auth middleware (JWT verify + role check)
              │                ├── Vendor isolation middleware
              │                ├── Controllers (14 route modules)
              │                ├── Prisma ORM ──▶ PostgreSQL 16
              │                └── Redis 7 (cache + rate-limit)
              └── /* ──▶ Frontend (Vite + React :5173)
                           └── Served via `serve` in production
```

### 3.2 Container Topology

| Service | Image | Port(s) | Dependencies |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | — |
| `redis` | redis:7-alpine | 6379 | — |
| `backend` | node:20-slim | 3000 | postgres (health), redis (health) |
| `frontend` | node:20-alpine (multi-stage) | 5173 | backend |
| `nginx` | nginx:alpine | 80, 443 | frontend, backend |

### 3.3 Data Flow

```
1. Client requests page → Nginx (port 80)
2. Nginx proxies /api/* → Backend :3000
3. Backend parses JWT from Authorization header
4. Middleware chain: helmet → cors → rate-limit → auth → vendor-isolation
5. Controller executes business logic via Prisma
6. Prisma translates to parameterized SQL → PostgreSQL
7. Response flows back through the chain
8. Redis caches frequent queries (product listings, categories)
```

### 3.4 Key Design Decisions

- **Singleton PrismaClient** — one connection pool per process, configured in `backend/src/config/prisma.js`
- **Stateless auth** — JWT access tokens (15m) + refresh tokens (7d); refresh tokens stored in DB for revocation
- **Local file storage** with Sharp image resizing (1200×1200); S3 adapter placeholder for cloud migration
- **Nginx reverse proxy** handles SSL termination, static file serving, and load balancing

---

## 4. ERD / Schema

### 4.1 Entity Relationship Diagram

```
users (1) ──── (0..1) vendors
users (1) ──── (0..N) orders
users (1) ──── (0..N) reviews
users (1) ──── (0..N) cart_items
users (1) ──── (0..N) wishlist_items
users (1) ──── (0..N) addresses
users (1) ──── (0..N) notifications
users (1) ──── (0..N) audit_logs

vendors (1) ──── (0..N) products
vendors (1) ──── (0..N) orders
vendors (1) ──── (0..N) payouts

categories (1) ──── (0..N) products (self-ref parentId for hierarchy)

products (1) ──── (0..N) product_images (cascade delete)
products (1) ──── (0..N) reviews (cascade delete)
products (1) ──── (0..N) order_items

orders (1) ──── (0..N) order_items (cascade delete)
orders (1) ──── (0..1) payment
orders (1) ──── (0..N) notifications
```

### 4.2 Model Summary (16 Models)

| Model | Key Fields | Constraints |
|---|---|---|
| **User** | id (UUID), email (unique), password (bcrypt), role (enum: ADMIN/VENDOR/CUSTOMER), isActive, refreshToken | `@unique` on email |
| **Vendor** | id, userId (unique FK→User), storeName (unique), storeSlug (unique), status (enum: PENDING/APPROVED/SUSPENDED), commissionRate, totalSales, totalEarnings | `@unique` on userId, storeName, storeSlug |
| **Category** | id, name (unique), slug (unique), parentId (self-ref FK) | Self-referential hierarchy |
| **Product** | id, vendorId (FK→Vendor), categoryId (FK→Category), name, slug (unique), price, discountPrice, stockQuantity, status (enum), averageRating, totalSales, ingredients, contraindications, sideEffects, storageInstructions, lowStockThreshold | Indexes on [vendorId], [categoryId], [slug], [status] |
| **ProductImage** | id, productId (FK→Product, cascade), url, isPrimary, sortOrder | FK cascade delete |
| **Review** | id, productId (FK→Product), userId (FK→User), rating, comment, isApproved, hidden | `@@unique([productId, userId])` |
| **CartItem** | id, userId (FK→User), productId (FK→Product), quantity | `@@unique([userId, productId])` |
| **WishlistItem** | id, userId (FK→User), productId (FK→Product) | `@@unique([userId, productId])` |
| **Address** | id, userId (FK→User), street, city, country (default: UG), isDefault | — |
| **Order** | id, orderNumber (unique), userId (FK), vendorId (FK→Vendor), addressId (FK→Address), status (enum: PENDING→DELIVERED), subtotal, deliveryFee, total, commissionRate, commissionAmount, vendorAmount | Indexes on [userId], [vendorId], [orderNumber] |
| **OrderItem** | id, orderId (FK→Order, cascade), productId (FK→Product), quantity, unitPrice, totalPrice | FK cascade delete |
| **Payment** | id, orderId (unique FK→Order), provider, transactionId (unique), reference (unique), amount, currency, status, providerData (JSON), callbackData (JSON) | `@unique` on orderId, transactionId, reference |
| **Payout** | id, vendorId (FK→Vendor), amount, commission, netAmount, status (enum: PENDING/PAID/REJECTED) | Index on [vendorId] |
| **Notification** | id, userId (FK→User), orderId (FK→Order), type, channel, title, message, isRead | Index on [userId] |
| **AuditLog** | id, userId (FK→User), vendorId (FK→Vendor), action, entity, entityId, metadata (JSON), ipAddress, userAgent | Indexes on [userId], [vendorId], [entity], [entityId] |
| **SiteSetting** | id, key (unique), value (JSON) | Key-value store |

---

## 5. ORM Transactions

### 5.1 Prisma Client Configuration

```javascript
// backend/src/config/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});
module.exports = prisma;
```

Singleton pattern ensures a single connection pool per Node.js process.

### 5.2 Transaction Patterns

**Order Creation** — atomic across order, inventory, and vendor stats:

```javascript
// Each vendor gets a separate order in the same request
for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
  let subtotal = 0;
  const orderItems = [];

  for (const { product, quantity } of vendorItems) {
    subtotal += (product.discountPrice || product.price) * quantity;
    orderItems.push({ productId: product.id, quantity, unitPrice, totalPrice });

    // Decrement stock + increment sales atomically
    await prisma.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: { decrement: quantity },
        totalSales: { increment: quantity },
      },
    });
  }

  // Create order with nested items
  const order = await prisma.order.create({
    data: {
      orderNumber, userId, vendorId, subtotal, total,
      commissionAmount, vendorAmount,
      items: { create: orderItems },
    },
  });

  // Clear user's cart after order placement
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
}
```

**Site Settings Upsert** — atomic create-or-update pattern:

```javascript
await prisma.siteSetting.upsert({
  where: { key: body.key },
  update: { value: body.value },
  create: { key: body.key, value: body.value },
});
```

### 5.3 Review Generation with Duplicate Prevention

```javascript
// Unique constraint [productId, userId] prevents duplicate reviews
const existing = await prisma.review.findUnique({
  where: { productId_userId: { productId: product.id, userId: customer.id } },
});
if (existing) continue; // Skip duplicates
await prisma.review.create({ data: { ... } });
```

### 5.4 Query Optimization

- **Composite indexes** on `Product([vendorId])`, `Product([categoryId])`, `Product([slug])`, `Product([status])`
- **Indexed joins** on `Order([userId])`, `Order([vendorId])`, `Order([orderNumber])`
- **Selective projection** using Prisma `select` to minimize data transfer (e.g., `select: { id: true, email: true, role: true }` in auth middleware)
- **Pagination** via `skip`/`take` with parallel `count()` query:
  ```javascript
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take, include: { ... } }),
    prisma.order.count({ where }),
  ]);
  ```
- **Batch aggregation** using `Promise.all` for parallel dashboard queries (up to 7 concurrent aggregation queries)

---

## 6. Security / RBAC Architecture

### 6.1 Role Hierarchy

```
ADMIN
  ├── Full platform read/write
  ├── Vendor management (approve, suspend, set commission)
  ├── Product moderation (approve, reject, feature)
  ├── Order oversight (all vendors)
  ├── Payment transaction list
  ├── Review moderation (show/hide/delete)
  └── Platform settings (commission, delivery, payment toggles, SEO)

VENDOR
  ├── Own product CRUD (vendor isolation enforced)
  ├── Own order view and status updates
  ├── Own store settings (name, description, logo, banner)
  ├── Payout history
  └── Dashboard analytics (sales, products, ratings)

CUSTOMER
  ├── Browse, search, filter products
  ├── Cart and wishlist management
  ├── Order placement and tracking
  ├── Submit reviews (auto-moderated)
  └── Profile management
```

### 6.2 Authentication Flow

```
1. Client POST /api/auth/login { email, password }
2. Server validates bcrypt hash (cost factor 12)
3. Server generates accessToken (HS256, 15m) + refreshToken (HS256, 7d)
4. Server stores refreshToken hash in user.refreshToken
5. Client stores tokens in localStorage
6. Subsequent requests include Authorization: Bearer <accessToken>
7. Authenticate middleware: verify JWT → fetch user → attach to req.user
8. Token expiry returns 401 with code TOKEN_EXPIRED → client auto-refreshes
9. Refresh endpoint verifies refreshToken against stored value → issues new pair
```

```javascript
// Token generation
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};
```

### 6.3 Authorization Middleware Chain

```javascript
// Role guard — single middleware handles all roles
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};

// Route example — only VENDOR or ADMIN can create products
router.post('/',
  authenticate,           // Must be logged in
  authorize('VENDOR', 'ADMIN'),  // Must have one of these roles
  getVendor,              // Fetch vendor profile
  upload.array('images', 10),    // Handle file uploads
  ctrl.create             // Execute controller
);
```

### 6.4 Vendor Data Isolation

The `vendorIsolation.js` middleware ensures vendors can only access their own resources:

```javascript
const vendorOwnership = (entityType) => async (req, res, next) => {
  if (req.user.role !== 'VENDOR') return next(); // Admin bypass

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  const entityId = req.params.id;

  switch (entityType) {
    case 'product':
      entity = await prisma.product.findUnique({ where: { id: entityId } });
      if (entity && entity.vendorId !== vendor.id)
        return res.status(403).json({ error: 'Access denied' });
      break;
    case 'order':
      entity = await prisma.order.findUnique({ where: { id: entityId } });
      if (entity && entity.vendorId !== vendor.id)
        return res.status(403).json({ error: 'Access denied' });
      break;
  }
  req.vendor = vendor;
  next();
};
```

The `getVendor` middleware loads the vendor profile into `req.vendor` for VENDOR users, enabling downstream controllers to filter queries by `vendorId`.

### 6.5 Security Controls

| Layer | Measure | Implementation |
|---|---|---|
| Transport | HTTPS | Nginx SSL termination + Let's Encrypt |
| Headers | Helmet | XSS, CSP, HSTS, frameguard, nosniff |
| CORS | Origin whitelist | Only `FRONTEND_URL` allowed |
| Auth | Password hashing | bcryptjs, cost factor 12 (~250ms per hash) |
| Auth | JWT algorithm | HS256, separate secrets for access/refresh |
| Rate Limit | API throttle | 100 requests per 15 min per IP |
| Validation | Input sanitization | express-validator + Zod schemas |
| Upload | File restrictions | Multer memory storage, 5MB limit, image resize via Sharp |
| Audit | CRUD logging | All actions logged to `audit_logs` table |

### 6.6 Audit Logging

```javascript
// backend/src/utils/audit.js
const logAction = async ({ userId, vendorId, action, entity, entityId, metadata, ipAddress, userAgent }) => {
  await prisma.auditLog.create({
    data: { userId, vendorId, action, entity, entityId, metadata, ipAddress, userAgent },
  });
};
```

Every controller that mutates data calls `logAction` before responding. The `audit_logs` table records who did what, to which entity, and from which IP.

---

## 7. Visualization Pipelines

### 7.1 Admin Dashboard — Data Aggregation

**Endpoint:** `GET /api/admin/dashboard` → `adminController.getDashboard`

The backend executes 7 parallel aggregation queries + 2 ranked list queries via `Promise.all`:

```javascript
const [totalVendors, activeVendors, totalOrders, totalRevenue, totalCommission,
       totalProducts, totalCustomers] = await Promise.all([
  prisma.vendor.count(),
  prisma.vendor.count({ where: { status: 'APPROVED' } }),
  prisma.order.count(),
  prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' } }),
  prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { ... } }),
  prisma.product.count({ where: { status: 'APPROVED' } }),
  prisma.user.count({ where: { role: 'CUSTOMER' } }),
]);

const topProducts = await prisma.product.findMany({
  where: { status: 'APPROVED' },
  orderBy: { totalSales: 'desc' },
  take: 10,
  include: { vendor: { select: { storeName: true } }, images: { take: 1 } },
});
```

**Frontend:** `pages/admin/Dashboard.jsx`
- 7 stat cards in a responsive grid (Customers, Vendors, Active, Products, Orders, Revenue, Commission)
- Top 10 Products table (rank, image thumbnail, name, vendor, units sold, revenue)
- Top 10 Vendors table (rank, store, product/order count, earnings, sales)

### 7.2 Vendor Dashboard — Store Analytics

**Endpoint:** `GET /api/dashboard/vendor` → `dashboardController.vendorDashboard`

```javascript
const [totalProducts, totalOrders, totalRevenue, recentOrders, lowStockProducts,
       expiredProducts, expiringProducts] = await Promise.all([...]);
```

**Key metrics:**
- Total products, active orders, total revenue, average rating, total sales, low-stock items
- Best sellers (top 10 by sales with images)
- Recent orders (last 10 with customer details)
- Low-stock alerts (products where stock ≤ threshold and availability = IN_STOCK)
- Expiry tracking (already expired + expiring within 90 days)

### 7.3 Vendor Analytics — Time-Series Charts

**Endpoint:** `GET /api/vendor/analytics` → rendered in `pages/vendor/Analytics.jsx`

Uses **Recharts** library with responsive containers:

```javascript
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Revenue line chart (7-day)
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={revenueOverTime}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>

// Orders bar chart (7-day)
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={ordersOverTime}>
    <Bar dataKey="orders" fill="#059669" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Summary cards:** Total Revenue, Total Orders, Total Products Sold, Average Order Value (all with UGX formatting and change indicators).

### 7.4 Vendor Inventory — Status Dashboard

**Endpoint:** `GET /api/vendor/inventory` → `pages/vendor/Inventory.jsx`

- **Summary cards:** Total Products, Low Stock (≤5), Out of Stock, Expiring Soon (≤30 days)
- **Filter tabs:** All / Low Stock / Out of Stock / Expiring Soon
- **Table:** Product thumbnail, name, stock (inline editable), price, expiry date (color-coded: red = expired, orange = expiring soon), update stock action

### 7.5 Public Vendor Page

Each vendor at `/vendor/:slug` displays:
- Gradient hero banner with store logo, name, and verification badge
- About section (store story, history, mission)
- Specialties rendered as tag chips
- Contact info (phone, email with protocol links, address)
- Operating hours
- Full product grid with SafeImage fallback

### 7.6 Glassmorphism UI System

The frontend uses Tailwind CSS with a custom design system:
- **Glass panels:** `backdrop-blur-xl` + `bg-white/70` with `border-gray-200/30`
- **Gradient backgrounds:** Fixed `from-gray-50 via-primary-50/50 to-herbal-50/30`
- **Custom shadows:** `shadow-glass`, `shadow-glass-sm`, `shadow-glass-lg`
- **SafeImage component:** React error-boundary wrapper that renders a fallback icon (`🌿`) when images fail to load

---

## 8. Cloud Deployment

### 8.1 Infrastructure Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| vCPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Docker | 24+ | 24+ |
| Domain | — | Fully qualified domain name |

### 8.2 Production Architecture

```
                          ┌─────────────┐
                          │  Let's      │
                          │  Encrypt    │
                          └──────┬──────┘
                                 │ SSL certs
                          ┌──────▼──────┐
  User ──HTTPS(443)──▶    │   Nginx     │
                          │  (Alpine)   │
                          └──┬──────┬───┘
                             │      │
                    /api/*   │      │  /*
                    ┌────────▼┐  ┌──▼─────────┐
                    │ Backend  │  │  Frontend   │
                    │  :3000   │  │  :5173      │
                    └──┬───┬──┘  └─────────────┘
                       │   │
                 ┌─────▼┐ ┌▼──────┐
                 │  PG  │ │ Redis │
                 │ 16   │ │  7    │
                 └──────┘ └───────┘
```

### 8.3 Step-by-Step Deployment

#### 1. Provision Server

```bash
# Deploy on Hetzner, DigitalOcean, AWS EC2, or any VPS
# Ubuntu 24.04 LTS, 2 vCPU, 4 GB RAM minimum

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### 2. Clone Repository

```bash
git clone <repo-url> /opt/emitidagala
cd /opt/emitidagala
```

#### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with production values:
#   NODE_ENV=production
#   JWT_SECRET=<random-64-char-string>
#   JWT_REFRESH_SECRET=<random-64-char-string>
#   POSTGRES_PASSWORD=<strong-password>
#   FRONTEND_URL=https://yourdomain.com
#   APP_URL=https://yourdomain.com
#   MTN_MOMO_ENVIRONMENT=production
#   STORAGE_DRIVER=local (or s3 for cloud)
```

#### 4. Deploy Services

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### 5. Initialize Database

```bash
# Push schema (migrations) — handled automatically by backend CMD
docker compose -f docker-compose.prod.yml exec backend npx prisma db push

# Seed data
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.js
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Obtain SSL certificate
docker run -it --rm \
  -v certbot_data:/etc/letsencrypt \
  -v nginx_data:/var/www/html \
  certbot/certbot certonly --webroot \
  -w /var/www/html -d yourdomain.com

# Update Nginx config to listen on 443 with SSL
# (Nginx config uses certbot_data volume)
docker compose -f docker-compose.prod.yml restart nginx
```

#### 7. Automated Backups

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U emitidagala emitidagala | gzip > database/backups/backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c database/backups/backup_20240101.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U emitidagala emitidagala

# Or use built-in scripts
./scripts/backup-db.sh
./scripts/restore-db.sh database/backups/backup_20240101_120000.sql.gz
```

#### 8. Monitoring

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx

# Service status
docker compose -f docker-compose.prod.yml ps

# Resource usage
docker stats
```

### 8.4 Production Docker Compose Differences

| Aspect | Development (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
|---|---|---|
| Port exposure | Full (5432, 6379) | Localhost-only (127.0.0.1) |
| Backend Dockerfile | `Dockerfile.dev` (nodemon) | `Dockerfile` (node start) |
| Frontend build | Dev server (Vite) | Multi-stage production build |
| SSL volumes | None | `certbot_data` mounted |
| `NODE_ENV` | `development` | `production` |
| Command | `npm run dev` | `npm start` |
| Restart policy | `unless-stopped` | `unless-stopped` |

### 8.5 CI/CD Pipeline (Optional)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/emitidagala
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
```

### 8.6 Scalability Considerations

- **API statelessness** — scale backend horizontally behind Nginx load balancer
- **Redis caching** — cache product listings and category trees; implement cache invalidation on write
- **PostgreSQL read replicas** — route dashboard/analytics queries to replicas
- **CDN** — serve product images and static assets via CloudFront or Cloudflare
- **Storage migration** — replace `LocalStorage` with `S3Storage` implementation for distributed file serving

---

*End of Technical Document — Emiti Dagala v1.0.0*
