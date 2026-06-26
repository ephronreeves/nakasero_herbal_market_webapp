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
    const body = req.body;

    if (body.key && body.value !== undefined) {
      const setting = await prisma.siteSetting.upsert({
        where: { key: body.key },
        update: { value: body.value },
        create: { key: body.key, value: body.value },
      });

      await logAction({
        userId: req.user.id,
        action: 'SETTINGS_UPDATED',
        entity: 'SiteSetting',
        description: `Setting ${body.key} updated`,
      });

      return res.json(setting);
    }

    const entries = Object.entries(body);
    for (const [key, value] of entries) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAction({
      userId: req.user.id,
      action: 'SETTINGS_UPDATED',
      entity: 'SiteSetting',
      description: 'Multiple settings updated',
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    const total = reviews.length;
    res.json({ reviews, total });
  } catch (error) {
    next(error);
  }
};

exports.moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hidden, isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(hidden !== undefined ? { hidden } : {}),
        ...(isApproved !== undefined ? { isApproved } : {}),
      },
    });

    res.json(review);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });

    await logAction({
      userId: req.user.id,
      action: 'REVIEW_DELETED',
      entity: 'Review',
      entityId: id,
      description: 'Review deleted by admin',
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, entity } = req.query;
    const where = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          vendor: { select: { id: true, storeName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.generateMockReviews = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'APPROVED' },
      take: 20,
    });

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
    });

    if (products.length === 0 || customers.length === 0) {
      return res.status(400).json({ error: 'Need both products and customers to generate reviews' });
    }

    const reviewTemplates = [
      { rating: 5, comment: 'Absolutely fantastic product! Exceeded my expectations. Will definitely order again.' },
      { rating: 5, comment: 'Pure quality! You can tell this is sourced from the best places. Highly recommend.' },
      { rating: 4, comment: 'Great quality and fast delivery. Very happy with my purchase.' },
      { rating: 4, comment: 'Good value for money. The product works as described.' },
      { rating: 5, comment: 'I have been using this for a week now and I can already feel the difference. Amazing!' },
      { rating: 4, comment: 'Authentic product. Packaged well and arrived on time.' },
      { rating: 3, comment: 'Decent product for the price. Could improve on packaging.' },
      { rating: 5, comment: 'My whole family loves this! We are repeat customers for a reason.' },
      { rating: 4, comment: 'Very good quality. Would recommend to anyone looking for natural products.' },
      { rating: 5, comment: 'Outstanding! The purity and freshness are unmatched. Five stars!' },
      { rating: 4, comment: 'Reliable vendor with consistent quality. My third time ordering.' },
      { rating: 5, comment: 'Life-changing product! So glad I found this marketplace.' },
      { rating: 4, comment: 'Good traditional medicine quality. Just as described.' },
      { rating: 3, comment: 'It works but takes time. Be patient with natural remedies.' },
      { rating: 5, comment: 'Perfect for my daily wellness routine. Excellent quality.' },
    ];

    let createdCount = 0;

    for (const product of products) {
      for (const customer of customers) {
        const existing = await prisma.review.findUnique({
          where: { productId_userId: { productId: product.id, userId: customer.id } },
        });
        if (existing) continue;

        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];

        await prisma.review.create({
          data: {
            productId: product.id,
            userId: customer.id,
            rating: template.rating,
            comment: template.comment,
            isApproved: Math.random() > 0.3,
          },
        });
        createdCount++;
      }
    }

    res.json({ success: true, count: createdCount, message: `Generated ${createdCount} mock reviews` });
  } catch (error) {
    next(error);
  }
};
