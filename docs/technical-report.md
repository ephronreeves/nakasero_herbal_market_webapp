# Technical Report: Emiti Dagala - Multi-Vendor Herbal E-Commerce Platform

## 1. Problem Statement

Access to authentic herbal medicine and natural health products is fragmented across informal
markets, individual sellers, and unverified sources. Buyers struggle to verify product quality,
compare prices across vendors, and trust the authenticity of traditional remedies. Sellers lack
a digital storefront infrastructure to reach a wider customer base and manage inventory efficiently.

**Emiti Dagala** ("Herbal Garden" in Luganda) solves this by providing a trusted, multi-vendor
e-commerce marketplace where verified herbal vendors can list products, manage inventory, and
process payments — while customers can browse, search, review, and purchase with confidence.

---

## 2. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F1 | User registration & authentication (JWT-based) | High |
| F2 | Role-based access: Admin, Vendor, Customer | High |
| F3 | Vendor storefront management (CRUD products) | High |
| F4 | Category browsing with hierarchical taxonomy | High |
| F5 | Shopping cart and checkout workflow | High |
| F6 | Order management with status tracking | High |
| F7 | Payment integration (MTN Mobile Money) | High |
| F8 | Full-text search across products | Medium |
| F9 | Product reviews and ratings | Medium |
| F10 | Vendor payout management | Medium |
| F11 | Admin dashboard with analytics | Medium |
| F12 | Inventory allocation & low-stock alerts | Low |
| F13 | Audit logging for compliance | Low |
| F14 | Wishlist management | Low |

### Non-Functional Requirements

| ID | Requirement |
|---|---|
| N1 | Stateless API with horizontal scalability |
| N2 | <500ms API response time for reads |
| N3 | PCI-compliant payment data handling |
| N4 | Containerized deployment (Docker) |
| N5 | PostgreSQL data integrity with foreign keys |
| N6 | Rate limiting on public endpoints |
| N7 | Helmet security headers + CORS |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────┐    ┌─────────┐    ┌──────────┐
│ Browser │───▶│  Nginx  │───▶│ Frontend │
└─────────┘    │  Proxy  │    │ (Vite +  │
               │         │    │  React)  │
               │         │    └──────────┘
               │         │    ┌──────────┐
               │         │───▶│ Backend  │
               │         │    │(Express +│
               │         │    │  Prisma) │
               └─────────┘    └────┬─────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │PostgreSQL│  │  Redis   │  │ Storage  │
              │   DB     │  │  Cache   │  │(Local/S3)│
              └──────────┘  └──────────┘  └──────────┘
```

### 3.2 Component Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3 | SPA with role-specific dashboards |
| **API** | Express 4 (Node.js 20) | RESTful JSON API |
| **ORM** | Prisma 5 | Type-safe DB access & migrations |
| **Database** | PostgreSQL 16 | Primary data store |
| **Cache** | Redis 7 | Session cache, rate limiting |
| **Reverse Proxy** | Nginx (Alpine) | Routing, static files, SSL |
| **Container** | Docker + Compose | Dev & production orchestration |
| **Payments** | MTN MoMo API | Mobile money processing |

### 3.3 Data Flow

```
Client Request
  │
  ▼
Nginx (port 80/443)
  ├── /api/*  ──▶ Backend (port 3000)
  │                 ├── middleware (auth, validation, rate-limit)
  │                 ├── controller (business logic)
  │                 ├── Prisma ORM ──▶ PostgreSQL
  │                 └── Redis cache lookup
  └── /*       ──▶ Frontend (port 5173)
```

---

## 4. Entity-Relationship Diagram (ERD)

### Core Models

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │1───▶│  Vendor  │1───▶│ Product  │
└──────────┘     └──────────┘     └────┬─────┘
       │                               │
       │1                              │N
       ▼                               ▼
┌──────────┐                   ┌──────────────┐
│  Order   │                   │ ProductImage │
└────┬─────┘                   └──────────────┘
     │1
     ▼
┌──────────┐     ┌──────────┐
│ OrderItem│────▶│ Payment  │
└──────────┘     └──────────┘

┌──────────┐     ┌──────────┐
│Category  │1───▶│ Product  │
└──────────┘     └──────────┘

┌──────────┐     ┌──────────┐
│   User   │1───▶│  Review  │◀─── Product
└──────────┘     └──────────┘
```

### Full Schema (14 Models)

| Model | Fields | Key Relations |
|---|---|---|
| **User** | id, email, password, firstName, lastName, role (enum), phone, isActive, refreshToken | -> Vendor, -> Order, -> Review, -> CartItem, -> WishlistItem |
| **Vendor** | id, userId, storeName, storeSlug, status (enum), verificationBadge, commissionRate, totalSales/Earnings | -> Product, -> Order, -> Payout |
| **Category** | id, name, slug, parentId (self-ref) | -> Product (children hierarchy) |
| **Product** | id, vendorId, categoryId, name, slug, price, stockQuantity, status, averageRating, isVerified | -> Vendor, -> Category, -> ProductImage, -> Review, -> OrderItem |
| **ProductImage** | id, productId, url, isPrimary, sortOrder | -> Product (cascade delete) |
| **Review** | id, productId, userId, rating, comment, isApproved | Unique(productId, userId) |
| **CartItem** | id, userId, productId, quantity | Unique(userId, productId) |
| **WishlistItem** | id, userId, productId | Unique(userId, productId) |
| **Address** | id, userId, street, city, country, isDefault | -> Order |
| **Order** | id, orderNumber, userId, vendorId, status (enum), subtotal, total, commissionAmount | -> User, -> Vendor, -> OrderItem, -> Payment |
| **OrderItem** | id, orderId, productId, quantity, unitPrice | -> Order (cascade), -> Product |
| **Payment** | id, orderId, provider, transactionId, amount, status, providerData (JSON) | Unique(orderId) |
| **Payout** | id, vendorId, amount, commission, netAmount, status (enum) | -> Vendor |
| **Notification** | id, userId, orderId, type, channel, title, message, isRead | -> User, -> Order |
| **AuditLog** | id, userId, vendorId, action, entity, entityId, metadata (JSON), ipAddress | -> User, -> Vendor |
| **SiteSetting** | id, key (unique), value (JSON) | Key-value store |

---

## 5. ORM Transactions & Data Access

### 5.1 Prisma Client Configuration

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

Singleton pattern ensures a single connection pool throughout the application lifecycle.

### 5.2 Transaction Examples

**Order Creation** — ensures atomicity across order, payment, and inventory:

```javascript
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  const payment = await tx.payment.create({ data: paymentData });
  await tx.product.update({
    where: { id: productId },
    data: { stockQuantity: { decrement: quantity } },
  });
  return order;
});
```

**Cart Checkout** — batch update with stock validation:

```javascript
const cartItems = await tx.cartItem.findMany({ where: { userId }, include: { product: true } });
for (const item of cartItems) {
  if (item.product.stockQuantity < item.quantity) {
    throw new Error(`Insufficient stock for ${item.product.name}`);
  }
}
await tx.cartItem.deleteMany({ where: { userId } });
```

### 5.3 Query Optimization

- Composite indexes on `[vendorId]`, `[categoryId]`, `[slug]`, `[status]` in Product table
- Indexed `[userId, vendorId, orderNumber]` in Order table
- Selective field projection using Prisma `select` to minimize data transfer
- Pagination via `skip`/`take` with total count

---

## 6. Security Architecture & RBAC

### 6.1 Role Hierarchy

```
ADMIN
  ├── Full platform access
  ├── Vendor management (approve/suspend)
  ├── Product moderation (approve/reject)
  ├── Order management
  └── Platform settings

VENDOR
  ├── Own product CRUD
  ├── Own orders view
  ├── Payout history
  └── Store analytics

CUSTOMER
  ├── Browse/search products
  ├── Place orders
  ├── Manage cart & wishlist
  └── Submit reviews
```

### 6.2 Authentication Flow

```
1. Client POST /api/auth/login { email, password }
2. Server validates bcrypt hash
3. Server issues accessToken (15m) + refreshToken (7d)
4. Client stores tokens (httpOnly cookie for refresh)
5. AccessToken sent in Authorization: Bearer header
6. OptionalAuth middleware attaches user if token present
7. Authenticate middleware rejects missing/expired tokens
8. Authorize('VENDOR', 'ADMIN') checks role membership
```

### 6.3 Security Measures

| Measure | Implementation |
|---|---|
| Password Hashing | bcryptjs with cost factor 12 |
| JWT Tokens | HS256 with separate secrets for access/refresh |
| Token Expiry | 15 min access, 7 day refresh |
| Rate Limiting | express-rate-limit (100 req/15min) |
| HTTP Headers | helmet (XSS, CSP, HSTS, etc.) |
| Input Validation | express-validator + Zod schemas |
| CORS | Whitelist FRONTEND_URL only |
| Vendor Isolation | vendorIsolation middleware checks ownership |
| Audit Logging | All CRUD actions logged with user/vendor/entity |
| File Upload | Multer with 5MB limit, memory storage |

### 6.4 Vendor Data Isolation

The `vendorIsolation.js` middleware ensures vendors can only access their own data:

```javascript
// Products
router.put('/:id', authenticate, authorize('VENDOR', 'ADMIN'),
  getVendor, vendorOwnership('product'), ctrl.update);

// Orders - admin bypass, vendor scoped
if (req.user.role !== 'VENDOR') return next(); // admin passes through
const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
// Only return orders where order.vendorId === vendor.id
```

---

## 7. Visualization Pipelines

### 7.1 Admin Dashboard Analytics

The admin dashboard (`/api/admin/dashboard`) aggregates:

| Metric | Query | Visualization |
|---|---|---|
| Total Revenue | `SUM(order.total) WHERE status = DELIVERED` | Stat card |
| Monthly Sales | `GROUP BY month ORDER BY month` | Line chart (Recharts) |
| Top Vendors | `GROUP BY vendorId ORDER BY SUM(total) DESC LIMIT 10` | Bar chart |
| Product Categories | `GROUP BY categoryId` | Pie chart |
| Order Status | `GROUP BY status` | Doughnut chart |
| Recent Orders | `ORDER BY createdAt DESC LIMIT 5` | Table |

### 7.2 Vendor Analytics

Vendor-specific (`/api/dashboard/vendor`):

| Metric | Source |
|---|---|
| Store earnings (total/net) | Vendor model totalEarnings |
| Product performance | Per-product sales & rating |
| Order fulfillment | Order counts by status |
| Payout history | Payout records |
| Low stock alerts | Products where stockQuantity < lowStockThreshold |

### 7.3 Frontend Visualization Stack

```javascript
// Recharts example (vendor/Inventory.jsx)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={salesData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="sales" fill="#16a34a" />
  </BarChart>
</ResponsiveContainer>
```

---

## 8. Cloud Deployment Steps

### 8.1 Docker-Based Deployment (Current)

```bash
# Build and start all services
docker-compose up -d --build

# Run migrations and seed
docker-compose exec backend npx prisma db push
docker-compose exec backend node prisma/seed.js
```

### 8.2 Production Deployment (VPS/Cloud)

**Recommended Provider:** Hetzner, DigitalOcean, or AWS EC2

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    restart: always

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/emitidagala
    depends_on: [postgres]
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile  # Production build (multi-stage)
    restart: always
```

**Steps:**

1. **Provision server** — Ubuntu 24.04 LTS, 2 vCPU, 4GB RAM minimum
2. **Install Docker** — `curl -fsSL https://get.docker.com | sh`
3. **Clone repo** — `git clone <repo-url> /opt/emitidagala`
4. **Configure env** — `cp .env.example .env` and set production secrets
5. **Deploy** — `docker compose -f docker-compose.prod.yml up -d`
6. **SSL** — Use Caddy or Nginx Proxy Manager for Let's Encrypt
7. **Backup** — Automated `pg_dump` via cron (included in `scripts/`)

### 8.3 CI/CD Pipeline (Future)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.prod.yml build
      - run: docker compose -f docker-compose.prod.yml up -d
```

---

## 9. API Endpoint Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Register customer |
| POST | /api/auth/login | None | Login |
| POST | /api/auth/refresh | None | Refresh token |
| GET | /api/auth/me | All | Current user |
| GET | /api/products | Optional | List products (paginated) |
| GET | /api/products/:slug | Optional | Product detail |
| POST | /api/products | VENDOR/ADMIN | Create product |
| PUT | /api/products/:id | VENDOR/ADMIN | Update product |
| DELETE | /api/products/:id | VENDOR/ADMIN | Delete product |
| GET | /api/categories | None | List categories |
| GET | /api/vendors | None | List vendors |
| POST | /api/vendors/register | All | Register as vendor |
| GET | /api/cart | All | Get cart |
| POST | /api/cart | All | Add to cart |
| POST | /api/orders | All | Create order |
| GET | /api/orders | All | List orders |
| GET | /api/search?q= | None | Full-text search |
| GET | /api/admin/dashboard | ADMIN | Platform analytics |
| PATCH | /api/orders/:id/status | VENDOR/ADMIN | Update order status |
| POST | /api/payments/mtn/initiate | All | Initiate MoMo payment |

---

## 10. Performance & Scalability

### Current Performance (Docker Dev)

| Metric | Value |
|---|---|
| API Response (cached) | <100ms |
| API Response (DB) | <300ms |
| Frontend Build | ~7s |
| DB Seed Time | ~2s |

### Scalability Strategies

- **Stateless API** — Scale horizontally behind Nginx load balancer
- **Redis Caching** — Cache product listings and category trees
- **Read Replicas** — PostgreSQL read replicas for report queries
- **CDN** — CloudFront/Cloudflare for static assets and product images
- **Connection Pooling** — Prisma's built-in connection pool

---

## 11. Conclusion

Emiti Dagala delivers a production-ready multi-vendor e-commerce platform tailored for
the herbal medicine market. Built with modern JavaScript technologies and containerized
for seamless deployment, it provides:

- **Vendors** → Full inventory management and sales analytics
- **Customers** → Trusted marketplace with secure payments
- **Admins** → Platform oversight with data-driven dashboards

The modular architecture allows easy extension of payment gateways, storage backends,
and notification channels as the platform grows.
