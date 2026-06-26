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
    {
      email: 'spices@emitidagala.com', firstName: 'Joseph', lastName: 'Ssempijja',
      store: 'Nakasero Spice House',
      desc: 'Premium spices and seasonings from the heart of Nakasero Market.',
      about: 'For generations, Nakasero Spice House has been the heartbeat of Kampala\'s spice trade. Located in the bustling Nakasero Market, we source the finest spices from across Uganda and East Africa. Our master blenders combine traditional knowledge with modern quality standards to deliver spices that bring authentic flavor to every dish. Every grain we sell is hand-selected and sun-dried to preserve its natural aroma and potency.',
      specialties: 'Pilau Masala, Cinnamon Sticks, Black Pepper',
      phone: '+256 700 123 456',
      email: 'spices@emitidagala.com',
      address: 'Nakasero Market, Block B, Kampala',
      city: 'Kampala',
      hours: 'Mon–Sat: 6:00 AM – 8:00 PM, Sun: 8:00 AM – 2:00 PM',
    },
    {
      email: 'grains@emitidagala.com', firstName: 'Grace', lastName: 'Nakato',
      store: 'Kampala Grain & Seed Co.',
      desc: 'Quality grains, seeds, and organic produce from local farmers.',
      about: 'Kampala Grain & Seed Co. connects local farmers with quality-conscious buyers across Uganda. We believe in the power of seeds — from the humble chickpea to nutrient-rich moringa. Every grain we sell supports sustainable farming communities in the Central Region. Our partnerships with over 200 smallholder farmers ensure fair prices and the freshest harvests delivered directly to your doorstep.',
      specialties: 'Moringa Oleifera Seeds, Chick Peas, Sunflower Seeds',
      phone: '+256 700 234 567',
      email: 'grains@emitidagala.com',
      address: 'Kalerwe Market, Plot 15, Kampala',
      city: 'Kampala',
      hours: 'Mon–Sat: 7:00 AM – 7:00 PM, Sun: Closed',
    },
    {
      email: 'herbal@emitidagala.com', firstName: 'Deo', lastName: 'Kibirige',
      store: 'Jinja Herbal Remedies',
      desc: 'Traditional Ugandan herbal wellness products and natural remedies.',
      about: 'Nestled near the source of the Nile in Jinja, our herbal remedies harness Uganda\'s rich botanical heritage. We combine traditional Ugandan healing wisdom with modern research to create wellness products that nurture body and spirit. Our founder, Deo Kibirige, learned herbal medicine from his grandmother in Busoga and has spent 15 years researching and perfecting traditional formulations.',
      specialties: 'Moringa Capsules, Digestive Wellness Tea, Dried Turmeric',
      phone: '+256 700 345 678',
      email: 'herbal@emitidagala.com',
      address: 'Jinja Main Market, Shop 7, Jinja City',
      city: 'Jinja',
      hours: 'Mon–Sat: 8:00 AM – 6:00 PM, Sun: 9:00 AM – 1:00 PM',
    },
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
        storeDescription: `${v.desc}\n\n${v.about}\n\nSpecialties: ${v.specialties}\nHours: ${v.hours}`,
        storeBanner: '',
        contactEmail: v.email,
        contactPhone: v.phone,
        address: v.address,
        city: v.city,
        country: 'UG',
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
    { name: 'Spices & Seasonings', description: 'Natural spices for cooking and wellness' },
    { name: 'Seeds & Grains',     description: 'Nutritious seeds and grains' },
  ];
  const categories = [];
  for (const cat of categoryData) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const c = await prisma.category.upsert({ where: { slug }, update: {}, create: { ...cat, slug } });
    categories.push(c);
  }
  console.log('Categories created');

  // ── Products (mapped to uploaded images, distributed across vendors) ──
  // Vendor 0: Nakasero Spice House — spices & seasonings
  // Vendor 1: Kampala Grain & Seed Co. — grains, seeds & nuts
  // Vendor 2: Jinja Herbal Remedies — wellness & herbal remedies
  const products = [
    // ── Nakasero Spice House (8) ──
    { name: 'Big Dry Chilli',        slug: 'big-dry-chilli',       desc: 'Large dried chilies for cooking and medicinal warmth.',                        price: 8000,   stock: 120, cat: 'Spices & Seasonings', vendor: 0, featured: false, rating: 4.1, sales: 40 },
    { name: 'Black Pepper',          slug: 'black-pepper',         desc: 'Whole black peppercorns, known for digestive and anti-inflammatory benefits.', price: 10000,  stock: 150, cat: 'Spices & Seasonings', vendor: 0, featured: true,  rating: 4.6, sales: 90 },
    { name: 'Green Cardamom',        slug: 'cadamin-green',        desc: 'Aromatic green cardamom pods for culinary and digestive wellness.',             price: 15000,  stock: 60,  cat: 'Spices & Seasonings', vendor: 0, featured: true,  rating: 4.7, sales: 70 },
    { name: 'Cinnamon Sticks',      slug: 'cinamon-sticks',       desc: 'True cinnamon sticks for blood sugar support and flavor.',                      price: 12000,  stock: 90,  cat: 'Spices & Seasonings', vendor: 0, featured: true,  rating: 4.5, sales: 85 },
    { name: 'Coriander Seeds',      slug: 'corriander',           desc: 'Whole coriander seeds for digestive health and culinary use.',                  price: 8000,   stock: 130, cat: 'Spices & Seasonings', vendor: 0, featured: false, rating: 4.3, sales: 45 },
    { name: 'Cumin Seeds',          slug: 'cumin-seeds',          desc: 'Premium cumin seeds known for immune and digestive support.',                   price: 9000,   stock: 140, cat: 'Spices & Seasonings', vendor: 0, featured: false, rating: 4.4, sales: 60 },
    { name: 'Pilau Masala',         slug: 'pilau-masala',         desc: 'Traditional East African pilau spice blend.',                                    price: 12000,  stock: 90,  cat: 'Spices & Seasonings', vendor: 0, featured: false, rating: 4.7, sales: 80 },
    { name: 'Small Dry Red Chilli', slug: 'small-dry-red-chilli', desc: 'Small dried red chilies for heat and metabolism boost.',                         price: 7000,   stock: 130, cat: 'Spices & Seasonings', vendor: 0, featured: false, rating: 4.2, sales: 55 },
    // ── Kampala Grain & Seed Co. (8) ──
    { name: 'Almond Seeds',          slug: 'almon-seeds',          desc: 'Premium raw almond seeds packed with nutrients.',                              price: 12000,  stock: 80,  cat: 'Seeds & Grains',      vendor: 1, featured: false, rating: 4.3, sales: 55 },
    { name: 'Black Sunflower Seeds', slug: 'black-sunflower-seeds',desc: 'Organic black sunflower seeds rich in vitamins and healthy fats.',              price: 9000,   stock: 100, cat: 'Seeds & Grains',      vendor: 1, featured: false, rating: 4.2, sales: 35 },
    { name: 'Chick Peas',           slug: 'chick-peas',           desc: 'Dried chickpeas, a protein-rich staple grain.',                                 price: 7000,   stock: 200, cat: 'Seeds & Grains',      vendor: 1, featured: false, rating: 4.0, sales: 30 },
    { name: 'Fennel Seeds',         slug: 'fennel-seeds',         desc: 'Sweet fennel seeds for digestion and fresh breath.',                             price: 8000,   stock: 110, cat: 'Digestive Health',   vendor: 1, featured: false, rating: 4.3, sales: 50 },
    { name: 'Moringa Oleifera Seeds',slug: 'moringa-oreifra-seeds',desc: 'Moringa oleifera seeds for planting and oil extraction.',                        price: 18000,  stock: 45,  cat: 'Seeds & Grains',      vendor: 1, featured: false, rating: 4.4, sales: 35 },
    { name: 'Neem Seeds',           slug: 'neem-seeds',           desc: 'Neem seeds for natural skin care and pest control.',                            price: 14000,  stock: 55,  cat: 'Skin Care',          vendor: 1, featured: false, rating: 4.1, sales: 20 },
    { name: 'Wheat Seeds',          slug: 'wheat-seeds',          desc: 'Whole wheat seeds for sprouting and flour.',                                    price: 6000,   stock: 180, cat: 'Seeds & Grains',      vendor: 1, featured: false, rating: 4.0, sales: 25 },
    { name: 'White Sunflower Seeds',slug: 'white-sunflower-seeds',desc: 'Hulled white sunflower seeds for snacking and herbal oil.',                     price: 10000,  stock: 95,  cat: 'Seeds & Grains',      vendor: 1, featured: false, rating: 4.3, sales: 40 },
    // ── Jinja Herbal Remedies (7) ──
    { name: 'Digestive Wellness Tea',slug: 'digestive-wellness-tea',desc: 'Soothing herbal tea blend for digestive health.',                               price: 15000,  stock: 150, cat: 'Digestive Health',   vendor: 2, featured: false, rating: 4.2, sales: 85 },
    { name: 'Dried Bamboo Shoots',  slug: 'dried-bamboo-shoots',  desc: 'Naturally dried bamboo shoots for cooking and herbal remedies.',                 price: 11000,  stock: 50,  cat: 'Digestive Health',   vendor: 2, featured: false, rating: 4.0, sales: 25 },
    { name: 'Dried Ginger',         slug: 'dried-ginger',         desc: 'Pure dried ginger root for nausea relief and warming teas.',                     price: 10000,  stock: 100, cat: 'Digestive Health',   vendor: 2, featured: false, rating: 4.6, sales: 95 },
    { name: 'Dried Turmeric',       slug: 'dried-tumeric',        desc: 'Organic dried turmeric root for anti-inflammatory wellness.',                    price: 12000,  stock: 80,  cat: 'Pain Relief',        vendor: 2, featured: true,  rating: 4.8, sales: 110 },
    { name: 'Mondia Whitei',        slug: 'mondia-whitei',        desc: 'Traditional herb for energy and vitality (Mondia whitei).',                     price: 25000,  stock: 30,  cat: 'Energy & Vitality',  vendor: 2, featured: true,  rating: 4.9, sales: 65 },
    { name: 'Moringa Capsules',     slug: 'moringa-capsules',     desc: 'Pure moringa leaf extract for daily nutrition.',                                 price: 25000,  stock: 200, cat: 'Immune Support',     vendor: 2, featured: true,  rating: 4.5, sales: 120 },
    { name: 'Star Anise',           slug: 'star-anise',           desc: 'Star anise for respiratory health and aromatic cooking.',                        price: 13000,  stock: 70,  cat: 'Respiratory Health', vendor: 2, featured: true,  rating: 4.6, sales: 60 },
  ];

  for (const p of products) {
    const cat = categories.find(c => c.name === p.cat);
    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUsers[p.vendor].id } });
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: p.name,
        slug: p.slug,
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

    await prisma.productImage.create({
      data: { productId: product.id, url: `/api/uploads/products/${p.slug}.jpg`, isPrimary: true, sortOrder: 0 },
    });
  }
  console.log('Products created');

  // ── Addresses for customers ──
  const addresses = [];
  for (const user of customerUsers) {
    const addr = await prisma.address.upsert({
      where: { id: (await prisma.address.findFirst({ where: { userId: user.id } }))?.id || 'none' },
      update: {},
      create: { userId: user.id, label: 'Home', street: '123 Main St', city: 'Kampala', country: 'UG', isDefault: true },
    });
    addresses.push(addr);
  }
  console.log('Addresses created');

  // ── Collect created products ──
  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (product) createdProducts.push(product);
  }

  // ── Reviews ──
  const reviewData = [
    { userIdx: 0, slug: 'black-pepper',         rating: 5, comment: 'Excellent quality black pepper. Strong aroma and fresh taste. Will definitely buy again!' },
    { userIdx: 1, slug: 'black-pepper',         rating: 4, comment: 'Good quality peppercorns. Great value for the price.' },
    { userIdx: 2, slug: 'black-pepper',         rating: 5, comment: 'My go-to spice for everything. Love the freshness.' },
    { userIdx: 0, slug: 'cadamin-green',        rating: 5, comment: 'Aromatic cardamom pods. Makes my chai taste amazing!' },
    { userIdx: 1, slug: 'cadamin-green',        rating: 4, comment: 'Very fragrant. Good for both cooking and tea.' },
    { userIdx: 0, slug: 'cinamon-sticks',       rating: 5, comment: 'True Ceylon cinnamon. Perfect for blood sugar management.' },
    { userIdx: 2, slug: 'pilau-masala',         rating: 5, comment: 'Best pilau masala in Kampala! Authentic East African flavor.' },
    { userIdx: 1, slug: 'moringa-capsules',     rating: 5, comment: 'Taking these daily for a month. Feel more energetic already.' },
    { userIdx: 0, slug: 'moringa-capsules',     rating: 4, comment: 'Good quality moringa capsules. Fair price.' },
    { userIdx: 2, slug: 'dried-tumeric',        rating: 5, comment: 'Pure dried turmeric. Bright orange color shows high curcumin content.' },
    { userIdx: 1, slug: 'dried-tumeric',        rating: 5, comment: 'Excellent for golden milk. Quality is outstanding.' },
    { userIdx: 0, slug: 'mondia-whitei',        rating: 5, comment: 'Traditional herb that really works. My grandfather used this!' },
    { userIdx: 2, slug: 'digestive-wellness-tea', rating: 4, comment: 'Soothing blend. Helps with bloating after heavy meals.' },
    { userIdx: 1, slug: 'moringa-oreifra-seeds', rating: 4, comment: 'Seeds germinated well. Good for planting.' },
    { userIdx: 0, slug: 'chick-peas',           rating: 4, comment: 'Clean, well-sorted chickpeas. Cook up nicely.' },
    { userIdx: 2, slug: 'almon-seeds',          rating: 5, comment: 'Fresh and crunchy. Perfect for snacking.' },
    { userIdx: 0, slug: 'dried-ginger',         rating: 5, comment: 'Powerful dried ginger. Makes the best ginger tea for cold mornings.' },
    { userIdx: 1, slug: 'star-anise',           rating: 5, comment: 'Beautiful star anise. Perfect for my respiratory health.' },
    { userIdx: 2, slug: 'cumin-seeds',          rating: 4, comment: 'Good quality cumin. Adds great flavor to my dishes.' },
    { userIdx: 0, slug: 'fennel-seeds',         rating: 4, comment: 'Fresh fennel seeds. Great after meals for digestion.' },
  ];

  const reviewComments = [
    'Absolutely love this product! High quality and authentic.',
    'Been using this for weeks now and I am very impressed.',
    'Fair price for the quality. Will order again.',
    'Fast delivery and well packaged. Product is as described.',
    'This is my third purchase. Consistent quality every time.',
    'Highly recommended for anyone looking for natural products.',
    'Good traditional quality. Reminds me of what my grandmother used.',
    'Perfect for my daily health routine. Very satisfied.',
    'The freshness is amazing. You can tell it is sourced well.',
    'Great addition to my kitchen. Quality exceeds expectations.',
  ];

  for (const r of reviewData) {
    const product = createdProducts.find(p => p.slug === r.slug);
    if (!product) continue;
    const user = customerUsers[r.userIdx];
    try {
      await prisma.review.create({
        data: { productId: product.id, userId: user.id, rating: r.rating, comment: r.comment, isApproved: true },
      });
    } catch { /* skip duplicate */ }
  }

  for (const product of createdProducts) {
    for (const user of customerUsers) {
      const existing = await prisma.review.findUnique({
        where: { productId_userId: { productId: product.id, userId: user.id } },
      });
      if (existing) continue;

      const rating = Math.floor(Math.random() * 2) + 3;
      const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

      try {
        await prisma.review.create({
          data: {
            productId: product.id, userId: user.id, rating, comment,
            isApproved: Math.random() > 0.2,
          },
        });
      } catch { /* skip */ }
    }
  }

  console.log('Reviews created');

  // Recalculate average ratings
  for (const product of createdProducts) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      select: { rating: true },
    });
    if (reviews.length > 0) {
      const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: { averageRating: Math.round(avg * 10) / 10 },
      });
    }
  }
  console.log('Average ratings recalculated');

  // ── Orders ──
  const orderStatuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING'];
  const allVendors = await prisma.vendor.findMany();
  let orderIdx = 0;

  for (let ci = 0; ci < customerUsers.length; ci++) {
    const user = customerUsers[ci];
    const addr = addresses[ci];

    // Each customer gets 2 orders from different vendors
    for (let o = 0; o < 2; o++) {
      const vi = (ci + o) % allVendors.length;
      const vendor = allVendors[vi];
      const vendorProducts = createdProducts.filter(p => p.vendorId === vendor.id);
      if (vendorProducts.length === 0) continue;

      const itemCount = 1 + (o % 2); // 1 or 2 items
      const items = [];
      for (let i = 0; i < itemCount && i < vendorProducts.length; i++) {
        items.push(vendorProducts[i]);
      }

      const subtotal = items.reduce((sum, p) => sum + p.price * (1 + o), 0);
      const deliveryFee = subtotal >= 100000 ? 0 : 5000;
      const total = subtotal + deliveryFee;
      const commissionRate = 10;
      const commissionAmount = (subtotal * commissionRate) / 100;
      const vendorAmount = subtotal - commissionAmount;
      const status = orderStatuses[orderIdx % orderStatuses.length];

      const orderNumber = `ORD-${Date.now()}-${String(++orderIdx).padStart(5, '0')}`;
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          vendorId: vendor.id,
          addressId: addr.id,
          status,
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          commissionRate,
          commissionAmount,
          vendorAmount,
          paidAt: ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(status) ? new Date() : null,
          deliveredAt: status === 'DELIVERED' ? new Date() : null,
        },
      });

      for (const product of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: 1 + o,
            unitPrice: product.price,
            totalPrice: product.price * (1 + o),
          },
        });
      }

      const providers = ['MTN_MOBILE_MONEY', 'AIRTEL_MONEY'];
      const provider = providers[orderIdx % providers.length];
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider,
          transactionId: `TXN${Date.now()}${orderIdx}`,
          reference: `REF${Date.now()}${orderIdx}`,
          amount: total,
          currency: 'UGX',
          status: ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(status) ? 'PAID' : 'PENDING',
          paidAt: ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(status) ? new Date() : null,
        },
      });

      // Update vendor totals
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          totalSales: { increment: itemCount },
          totalEarnings: { increment: vendorAmount },
          totalCommission: { increment: commissionAmount },
          totalPayout: { increment: status === 'DELIVERED' ? vendorAmount : 0 },
          pendingPayout: { increment: status !== 'DELIVERED' && ['PAID', 'PROCESSING', 'SHIPPED'].includes(status) ? vendorAmount : 0 },
        },
      });
    }
  }
  console.log('Orders created with items and payments');

  // ── Audit Logs ──
  await prisma.auditLog.deleteMany();
  const allUsers = await prisma.user.findMany();
  const allVendorsList = await prisma.vendor.findMany();
  const seedActions = [
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Admin account created' },
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Vendor account created (Nakasero Spice House)' },
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Vendor account created (Kampala Grain & Seed Co.)' },
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Vendor account created (Jinja Herbal Remedies)' },
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Customer account created (Alice)' },
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Customer account created (Bob)' },
    { action: 'USER_REGISTERED', entity: 'User', desc: 'Customer account created (Carol)' },
    { action: 'VENDOR_STATUS_UPDATED', entity: 'Vendor', desc: 'Nakasero Spice House approved' },
    { action: 'VENDOR_STATUS_UPDATED', entity: 'Vendor', desc: 'Kampala Grain & Seed Co. approved' },
    { action: 'VENDOR_STATUS_UPDATED', entity: 'Vendor', desc: 'Jinja Herbal Remedies approved' },
    { action: 'SETTINGS_UPDATED', entity: 'SiteSetting', desc: 'Initial platform settings configured' },
    { action: 'ORDER_CREATED', entity: 'Order', desc: 'Seed orders created for demonstration' },
  ];

  for (let i = 0; i < seedActions.length; i++) {
    const sa = seedActions[i];
    const user = allUsers[i % allUsers.length];
    const vendor = allVendorsList.length > 0 ? allVendorsList[i % allVendorsList.length] : null;
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        vendorId: vendor?.id || null,
        action: sa.action,
        entity: sa.entity,
        description: sa.desc,
        ipAddress: '127.0.0.1',
        userAgent: 'Seed-Script/1.0',
      },
    });
  }
  console.log('Audit logs created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n─── Login Credentials ───');
  console.log(' Admin:    admin@emitidagala.com            / admin123');
  console.log(' Vendor:   spices@emitidagala.com           / vendor123  (Nakasero Spice House)');
  console.log(' Vendor:   grains@emitidagala.com           / vendor123  (Kampala Grain & Seed Co.)');
  console.log(' Vendor:   herbal@emitidagala.com           / vendor123  (Jinja Herbal Remedies)');
  console.log(' Customer: alice@example.com                / customer123');
  console.log(' Customer: bob@example.com                  / customer123');
  console.log(' Customer: carol@example.com                / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
