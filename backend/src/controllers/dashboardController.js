const prisma = require('../config/prisma');

exports.vendorDashboard = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const [totalProducts, totalOrders, totalRevenue, recentOrders, lowStockProducts, expiredProducts, expiringProducts] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id } }),
      prisma.order.count({ where: { vendorId: vendor.id } }),
      prisma.order.aggregate({
        _sum: { vendorAmount: true },
        where: { vendorId: vendor.id, status: { in: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] } },
      }),
      prisma.order.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { items: { include: { product: { select: { name: true } } } }, user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.product.findMany({
        where: { vendorId: vendor.id, stockQuantity: { lte: prisma.product.fields.lowStockThreshold }, availabilityStatus: 'IN_STOCK' },
        orderBy: { stockQuantity: 'asc' },
        take: 10,
      }),
      prisma.product.count({
        where: { vendorId: vendor.id, expiryDate: { lte: new Date() } },
      }),
      prisma.product.count({
        where: { vendorId: vendor.id, expiryDate: { gte: new Date(), lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const bestSellers = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { totalSales: 'desc' },
      take: 10,
      include: { images: { take: 1 } },
    });

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.vendorAmount || 0,
        pendingPayout: vendor.pendingPayout,
        totalEarnings: vendor.totalEarnings,
        totalSales: vendor.totalSales,
        lowStockCount: lowStockProducts.length,
        expiredProducts,
        expiringProducts,
      },
      vendor,
      recentOrders,
      lowStockProducts,
      bestSellers,
    });
  } catch (error) {
    next(error);
  }
};

exports.adminDashboard = async (req, res, next) => {
  try {
    const [totalVendors, pendingVendors, totalProducts, pendingProducts, totalOrders, totalRevenue, totalCustomers] = await Promise.all([
      prisma.vendor.count(),
      prisma.vendor.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PENDING' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    res.json({
      stats: {
        totalVendors,
        pendingVendors,
        totalProducts,
        pendingProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};
