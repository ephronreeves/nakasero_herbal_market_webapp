const prisma = require('../config/prisma');

exports.search = async (req, res, next) => {
  try {
    const { q, category, vendor, minPrice, maxPrice, rating, page = 1, limit = 20 } = req.query;

    const where = { status: 'APPROVED' };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { ingredients: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) where.categoryId = category;
    if (vendor) where.vendorId = vendor;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, storeName: true, storeSlug: true, verificationBadge: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { totalSales: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.suggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true, price: true, discountPrice: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      take: 5,
    });

    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'APPROVED',
        storeName: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, storeName: true, storeSlug: true, storeLogo: true },
      take: 3,
    });

    res.json({ products, vendors });
  } catch (error) {
    next(error);
  }
};
