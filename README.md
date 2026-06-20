# Emiti Dagala (Nakasero Herbal Market)

**Trusted Herbal Marketplace** — Victoria University coursework 3 webapp project.

A multi-vendor e-commerce marketplace dedicated to herbal medicine and natural health products.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Containerization:** Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git (optional)

### Setup

```bash
# Clone the repository
git clone https://github.com/ephronreeves/nakasero_herbal_market_webapp.git
cd nakasero_herbal_market_webapp

# Start all services (builds images, starts DB + backend + frontend)
docker-compose up -d

# Push the Prisma schema to PostgreSQL
docker-compose exec backend npx prisma db push

# Seed the database with mock data
docker-compose exec backend node prisma/seed.js
```

### Access the Application

| Service     | URL                    |
|-------------|------------------------|
| Frontend    | http://localhost:5173  |
| Backend API | http://localhost:3000  |
| Nginx       | http://localhost:80    |
| PostgreSQL  | localhost:5432         |
| Redis       | localhost:6379         |

### Default Credentials (Seeded Data)

| Role     | Email                       | Password    |
|----------|-----------------------------|-------------|
| Admin    | admin@emitidagala.com       | admin123    |
| Vendor   | spices@emitidagala.com      | vendor123   |
| Vendor   | grains@emitidagala.com      | vendor123   |
| Vendor   | herbal@emitidagala.com       | vendor123   |
| Customer | alice@example.com           | customer123 |
| Customer | bob@example.com             | customer123 |
| Customer | carol@example.com           | customer123 |

## Project Structure

```
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── layouts/   # Layout components
│   │   ├── contexts/  # React contexts
│   │   └── lib/       # Utilities (API client)
│   └── ...
├── backend/           # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/    # Auth, validation, vendor isolation
│   │   ├── services/     # External services (storage, notifications)
│   │   └── utils/        # Utilities (audit, slug)
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js       # Database seeder
│   └── ...
├── database/
│   ├── init/          # Database initialization scripts
│   └── backups/       # Automated backups
├── docker/            # Docker helper files
├── nginx/             # Nginx configuration
├── scripts/           # Utility scripts (backup, restore)
├── uploads/           # File uploads (products, logos)
├── docker-compose.yml # Docker Compose configuration
├── docker-compose.prod.yml # Production deployment config
└── .env               # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Products
- `GET /api/products` - List products (paginated, filterable)
- `GET /api/products/:slug` - Product detail
- `POST /api/products` - Create product (Vendor)
- `PUT /api/products/:id` - Update product (Vendor)
- `DELETE /api/products/:id` - Delete product (Vendor)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category detail

### Vendors
- `GET /api/vendors` - List vendors
- `GET /api/vendors/:slug` - Vendor detail
- `POST /api/vendors/register` - Register as vendor
- `GET /api/vendor/store` - Get own store settings (Vendor)
- `PUT /api/vendor/store` - Update store settings (Vendor)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Order detail
- `PATCH /api/orders/:id/status` - Update order status

### Payments
- `GET /api/payments/methods` - List payment methods
- `POST /api/payments/initiate` - Initiate payment (any method)
- `GET /api/payments/verify/:orderId` - Verify payment
- `POST /api/payments/callback` - Payment provider callback

### Reviews
- `GET /api/reviews/product/:productId` - List product reviews
- `POST /api/reviews/product/:productId` - Submit a review

### Admin
- `GET /api/admin/dashboard` - Platform analytics
- `GET /api/admin/vendors` - Manage vendors
- `PATCH /api/admin/vendors/:id` - Update vendor status/commission
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/reviews` - List all reviews
- `PATCH /api/admin/reviews/:id` - Moderate review
- `DELETE /api/admin/reviews/:id` - Delete review
- `POST /api/admin/reviews/generate-mock` - Generate mock reviews
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

### Search
- `GET /api/search?q=` - Full-text search
- `GET /api/search/suggestions?q=` - Search suggestions

### Uploads
- `GET /api/uploads/*` - Serve uploaded files (images, logos, banners)

### Health
- `GET /api/health` - Health check

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

## Database Backup

### Automated Backup (Docker)

```bash
# Manual backup
docker-compose exec postgres pg_dump -U emitidagala emitidagala | gzip > database/backups/emitidagala_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c database/backups/emitidagala_20240101.sql.gz | docker-compose exec -T postgres psql -U emitidagala emitidagala
```

### Using Backup Scripts

```bash
# Backup
./scripts/backup-db.sh

# Restore
./scripts/restore-db.sh database/backups/emitidagala_20240101_120000.sql.gz
```

## Deployment

### Local Development
```bash
docker-compose up -d --build
```

### Cloud Production (VPS)
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

Requirements: Ubuntu 24.04+, Docker, domain with SSL.

## Security

- JWT authentication with refresh tokens
- bcrypt password hashing (cost factor 12)
- Rate limiting on API routes (100 req/15min)
- Input validation (express-validator + zod)
- Helmet security headers (XSS, CSP, HSTS)
- Vendor data isolation middleware
- Audit logging for all CRUD actions

## License

MIT
