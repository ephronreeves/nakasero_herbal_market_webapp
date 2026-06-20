const prisma = require('../config/prisma');
const { logAction } = require('../utils/audit');

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalVendors, activeVendors, totalOrders, totalRevenue, totalCommission, totalProducts, totalCustomers] = await Promise.all([
      prisma.vendor.count(),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: { in: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] } } }),
      prisma.product.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    const topProducts = await prisma.product.findMany({
      where: { status: 'APPROVED' },
      orderBy: { totalSales: 'desc' },
      take: 10,
      include: { vendor: { select: { storeName: true } }, images: { take: 1 } },
    });

    const topVendors = await prisma.vendor.findMany({
      orderBy: { totalSales: 'desc' },
      take: 10,
      select: { id: true, storeName: true, storeSlug: true, totalSales: true, totalEarnings: true, _count: { select: { products: true, orders: true } } },
    });

    res.json({
      stats: {
        totalVendors,
        activeVendors,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCommission: totalCommission._sum.commissionAmount || 0,
        totalProducts,
        totalCustomers,
      },
      topProducts,
      topVendors,
    });
  } catch (error) {
    next(error);
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, verificationBadge, commissionRate } = req.body;

    const data = {};
    if (status) data.status = status;
    if (verificationBadge) data.verificationBadge = verificationBadge;
    if (commissionRate !== undefined) data.commissionRate = parseFloat(commissionRate);

    const vendor = await prisma.vendor.update({
      where: { id },
      data,
    });

    await logAction({
      userId: req.user.id,
      vendorId: id,
      action: 'VENDOR_STATUS_UPDATED',
      entity: 'Vendor',
      entityId: id,
      description: `Vendor ${vendor.storeName} status updated`,
    });

    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: { select: { id: true, storeName: true, storeSlug: true } },
          category: { select: { id: true, name: true } },
          images: { take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          vendor: { select: { id: true, storeName: true } },
          items: { include: { product: { select: { name: true } } } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: { select: { orderNumber: true, total: true, user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.getSettings = async (req, res) => {
  const settings = await prisma.siteSetting.findMany();
  const result = {};
  settings.forEach(s => { result[s.key] = s.value; });
  res.json(result);
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await logAction({
      userId: req.user.id,
      action: 'SETTINGS_UPDATED',
      entity: 'SiteSetting',
      description: `Setting ${key} updated`,
    });

    res.json(setting);
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

exports.moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    res.json(review);
  } catch (error) {
    next(error);
  }
};
