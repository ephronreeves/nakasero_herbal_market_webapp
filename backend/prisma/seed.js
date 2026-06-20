const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hash = (pw) => bcrypt.hash(pw, 12);

  const adminPw = await hash('admin123');
  const vendorPw = await hash('vendor123');
  const customerPw = await hash('customer123');

  // ── Admin ──
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emitidagala.com' },
    update: {},
    create: { email: 'admin@emitidagala.com', password: adminPw, firstName: 'Platform', lastName: 'Admin', role: 'ADMIN' },
  });
  console.log('Admin created:', admin.email);

  // ── Vendors ──
  const vendorUsers = [];
  const vendorData = [
    { email: 'herbalife@emitidagala.com',  firstName: 'John',   lastName: 'Mukasa',  store: 'Herbal Life Uganda',    desc: 'Premium organic herbal remedies sourced from across Uganda.' },
    { email: 'nature@emitidagala.com',     firstName: 'Sarah',  lastName: 'Nabatanzi', store: 'Nature\'s Pharmacy',    desc: 'Traditional herbal medicines passed down through generations.' },
    { email: 'green@emitidagala.com',      firstName: 'Peter',  lastName: 'Okello',   store: 'Green Earth Herbs',     desc: 'Sustainable herbal products for modern wellness.' },
  ];

  for (const v of vendorData) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: { email: v.email, password: vendorPw, firstName: v.firstName, lastName: v.lastName, role: 'VENDOR' },
    });
    await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        storeName: v.store,
        storeSlug: v.store.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        storeDescription: v.desc,
        status: 'APPROVED',
        verificationBadge: 'VERIFIED',
        commissionRate: 10,
      },
    });
    vendorUsers.push(user);
    console.log('Vendor created:', v.store);
  }

  // ── Customers ──
  const customerUsers = [];
  const customerData = [
    { email: 'alice@example.com',  firstName: 'Alice',  lastName: 'Nanyonga' },
    { email: 'bob@example.com',    firstName: 'Bob',     lastName: 'Kintu' },
    { email: 'carol@example.com',  firstName: 'Carol',   lastName: 'Achieng' },
  ];
  for (const c of customerData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, password: customerPw, firstName: c.firstName, lastName: c.lastName, role: 'CUSTOMER' },
    });
    customerUsers.push(user);
    console.log('Customer created:', c.email);
  }

  // ── Site Settings ──
  const settings = [
    { key: 'default_commission_rate', value: 10 },
    { key: 'platform_name', value: 'Emiti Dagala' },
    { key: 'platform_tagline', value: 'Trusted Herbal Marketplace' },
    { key: 'delivery_fee', value: 5000 },
    { key: 'free_delivery_threshold', value: 100000 },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('Settings created');

  // ── Categories ──
  const categoryData = [
    { name: 'Immune Support',     description: 'Products to boost immune system' },
    { name: 'Digestive Health',   description: 'Herbal remedies for digestion' },
    { name: 'Stress & Anxiety',   description: 'Natural calming products' },
    { name: 'Pain Relief',        description: 'Herbal pain management' },
    { name: 'Skin Care',          description: 'Natural skin treatments' },
    { name: 'Energy & Vitality',  description: 'Natural energy boosters' },
    { name: 'Weight Management',  description: 'Herbal weight support' },
    { name: 'Respiratory Health', description: 'Lung and respiratory support' },
  ];
  const categories = [];
  for (const cat of categoryData) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const c = await prisma.category.upsert({ where: { slug }, update: {}, create: { ...cat, slug } });
    categories.push(c);
  }
  console.log('Categories created');

  // ── Products ──
  const products = [
    { name: 'Moringa Capsules',          desc: 'Pure moringa leaf extract for daily nutrition.',             price: 25000,  stock: 200, cat: 'Immune Support',     vendor: 0, featured: true,  rating: 4.5, sales: 120 },
    { name: 'Digestive Wellness Tea',    desc: 'Soothing herbal tea blend for digestive health.',            price: 15000,  stock: 150, cat: 'Digestive Health',   vendor: 0, featured: false, rating: 4.2, sales: 85 },
    { name: 'Calm Mind Tincture',        desc: 'Passionflower and chamomile tincture for stress relief.',    price: 35000,  stock: 80,  cat: 'Stress & Anxiety',   vendor: 1, featured: true,  rating: 4.7, sales: 200 },
    { name: 'Turmeric Gold Capsules',    desc: 'Anti-inflammatory turmeric with black pepper.',              price: 28000,  stock: 120, cat: 'Pain Relief',        vendor: 1, featured: false, rating: 4.4, sales: 95 },
    { name: 'Aloe Vera Healing Gel',     desc: 'Pure aloe vera gel for skin care.',                          price: 18000,  stock: 90,  cat: 'Skin Care',          vendor: 2, featured: false, rating: 4.6, sales: 140 },
    { name: 'Energy Boost Elixir',       desc: 'Ginseng and maca root energy supplement.',                   price: 32000,  stock: 60,  cat: 'Energy & Vitality',  vendor: 2, featured: true,  rating: 4.3, sales: 75 },
    { name: 'Green Tea Fat Burner',      desc: 'Green tea extract for weight management support.',           price: 22000,  stock: 100, cat: 'Weight Management',  vendor: 0, featured: false, rating: 4.0, sales: 60 },
    { name: 'Eucalyptus Breathe Easy',   desc: 'Eucalyptus oil blend for respiratory relief.',               price: 20000,  stock: 70,  cat: 'Respiratory Health', vendor: 1, featured: false, rating: 4.8, sales: 160 },
    { name: 'Elderberry Immune Syrup',   desc: 'Rich elderberry syrup for immune defense.',                  price: 30000,  stock: 110, cat: 'Immune Support',     vendor: 2, featured: true,  rating: 4.9, sales: 250 },
    { name: 'Probiotic Gut Health',      desc: 'Fermented herbal probiotic for gut health.',                  price: 40000,  stock: 40,  cat: 'Digestive Health',   vendor: 0, featured: false, rating: 4.1, sales: 45 },
  ];

  for (const p of products) {
    const cat = categories.find(c => c.name === p.cat);
    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUsers[p.vendor].id } });
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: p.name,
        slug,
        description: p.desc,
        price: p.price,
        stockQuantity: p.stock,
        status: 'APPROVED',
        availabilityStatus: 'IN_STOCK',
        isVerified: true,
        isFeatured: p.featured,
        averageRating: p.rating,
        totalSales: p.sales,
        lowStockThreshold: 5,
      },
    });

    // Add product images
    await prisma.productImage.create({
      data: { productId: product.id, url: `/uploads/products/${slug}.jpg`, isPrimary: true, sortOrder: 0 },
    });
  }
  console.log('Products created');

  // ── Addresses for customers ──
  for (const user of customerUsers) {
    await prisma.address.upsert({
      where: { id: (await prisma.address.findFirst({ where: { userId: user.id } }))?.id || 'none' },
      update: {},
      create: { userId: user.id, label: 'Home', street: '123 Main St', city: 'Kampala', country: 'UG', isDefault: true },
    });
  }
  console.log('Addresses created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n─── Login Credentials ───');
  console.log(' Admin:    admin@emitidagala.com / admin123');
  console.log(' Vendor:   herbalife@emitidagala.com / vendor123');
  console.log(' Vendor:   nature@emitidagala.com / vendor123');
  console.log(' Vendor:   green@emitidagala.com / vendor123');
  console.log(' Customer: alice@example.com / customer123');
  console.log(' Customer: bob@example.com / customer123');
  console.log(' Customer: carol@example.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
