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
<<<<<<< HEAD
| Vendor   | herbal@emitidagala.com       | vendor123   |
=======
| Vendor   | herbal@emitidagala.com      | vendor123   |
>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)
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
<<<<<<< HEAD
- `GET /api/products` - List products (paginated, filterable)
=======
- `GET /api/products` - List products (filterable: `?category=`, `?vendor=`, `?status=`, `?sort=`, `?page=`, `?limit=`)
>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)
- `GET /api/products/:slug` - Product detail
- `POST /api/products` - Create product (Vendor/Admin)
- `PUT /api/products/:id` - Update product (Vendor/Admin)
- `DELETE /api/products/:id` - Delete product (Vendor/Admin)
- `PATCH /api/products/:id/status` - Update product status (Admin)
- `DELETE /api/products/images/:imageId` - Delete product image

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category detail
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Vendors
- `GET /api/vendors` - List vendors
- `GET /api/vendors/:slug` - Vendor detail
- `POST /api/vendors/register` - Register as vendor
<<<<<<< HEAD
- `GET /api/vendor/store` - Get own store settings (Vendor)
- `PUT /api/vendor/store` - Update store settings (Vendor)
=======
- `GET /api/vendors/me/store` - Get own store (Vendor)
- `PUT /api/vendors/profile` - Update vendor profile (Vendor)
>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - List wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/track/:orderNumber` - Track order by number
- `GET /api/orders/:id` - Order detail
- `PATCH /api/orders/:id/status` - Update order status (Vendor/Admin)

### Payments
<<<<<<< HEAD
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
=======
- `GET /api/payments/methods` - List available payment methods
- `POST /api/payments/initiate` - Initiate payment (MTN, Airtel, Visa, Apple Pay)
- `POST /api/payments/callback` - Generic payment callback
- `GET /api/payments/verify/:orderId` - Verify payment status
- `POST /api/payments/mtn/initiate` - Initiate MTN MoMo payment (legacy)
- `POST /api/payments/mtn/callback` - MTN MoMo callback (legacy)

### Reviews
- `GET /api/reviews/product/:productId` - List reviews for a product
- `POST /api/reviews/product/:productId` - Create review

### Payouts
- `GET /api/payouts` - List payouts (Vendor/Admin)
- `POST /api/payouts` - Create payout (Admin)
- `PATCH /api/payouts/:id` - Update payout status (Admin)

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Dashboard
- `GET /api/dashboard/vendor` - Vendor dashboard stats
- `GET /api/dashboard/admin` - Admin dashboard stats

### Admin
- `GET /api/admin/dashboard` - Platform analytics overview
- `GET /api/admin/vendors` - List vendors
- `PATCH /api/admin/vendors/:id` - Update vendor status
- `GET /api/admin/products` - Manage products (filter: `?status=`)
- `GET /api/admin/orders` - Manage orders (filter: `?status=`)
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings
- `GET /api/admin/reviews` - List all reviews
- `PATCH /api/admin/reviews/:id` - Moderate review (show/hide)
- `DELETE /api/admin/reviews/:id` - Delete review
- `POST /api/admin/reviews/generate-mock` - Generate mock reviews

### Uploads
- `POST /api/uploads` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files (max 10)
>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)

### Search
- `GET /api/search?q=` - Full-text search
- `GET /api/search/suggestions?q=` - Search suggestions

<<<<<<< HEAD
### Uploads
- `GET /api/uploads/*` - Serve uploaded files (images, logos, banners)

### Health
- `GET /api/health` - Health check

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

=======
### Health
- `GET /api/health` - Health check

>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)
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

<<<<<<< HEAD
### Local Development
=======
### Local (Docker Compose)
>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)
```bash
# Build and start all services
docker-compose up -d --build

# Initialize database
docker-compose exec backend npx prisma db push

# Seed mock data
docker-compose exec backend node prisma/seed.js
```

<<<<<<< HEAD
### Cloud Production (VPS)
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

Requirements: Ubuntu 24.04+, Docker, domain with SSL.
=======
### Cloud Deployment (VPS)
The application is designed for deployment to any VPS with Docker:
- Hetzner, AWS EC2, DigitalOcean Droplet, or any Linux VPS

#### Steps
1. **Provision a VPS** with Docker and Docker Compose installed
2. **Clone the repository** on the server
3. **Configure environment** - Copy `.env.example` to `.env` and set production values:
   - `NODE_ENV=production`
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values
   - `FRONTEND_URL` to your domain
4. **Build and run**:
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```
5. **Set up reverse proxy** — Nginx handles this already on port 80
6. **SSL with Let's Encrypt**:
   ```bash
   docker run -it --rm -v nginx_data:/etc/nginx/conf.d \
     -v certbot_data:/etc/letsencrypt \
     certbot/certbot certonly --webroot -w /var/www/html -d yourdomain.com
   ```
7. **Database backups** — The built-in backup scripts run daily via cron:
   ```bash
   ./scripts/cron-backup
   ```
8. **Monitoring** — Check logs:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f nginx
   ```
>>>>>>> 32c5519 (Multi-vendor e-commerce platform with payment methods, admin settings, mobile optimization, and mock reviews)

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
