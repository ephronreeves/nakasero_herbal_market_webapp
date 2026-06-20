const prisma = require('../config/prisma');
const { uniqueSlug } = require('../utils/slug');
const { logAction } = require('../utils/audit');
const storage = require('../services/storage');

exports.register = async (req, res, next) => {
  try {
    const existing = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(400).json({ error: 'Vendor profile already exists' });
    }

    const storeSlug = await uniqueSlug(req.body.storeName, prisma.vendor, 'storeSlug');

    const vendor = await prisma.vendor.create({
      data: {
        userId: req.user.id,
        storeName: req.body.storeName,
        storeSlug,
        storeDescription: req.body.storeDescription,
        contactEmail: req.body.contactEmail || req.user.email,
        contactPhone: req.body.contactPhone,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country || 'UG',
        commissionRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE || '10'),
      },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'VENDOR' },
    });

    await logAction({
      userId: req.user.id,
      vendorId: vendor.id,
      action: 'VENDOR_REGISTERED',
      entity: 'Vendor',
      entityId: vendor.id,
    });

    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { storeSlug: req.params.slug },
      include: {
        products: {
          where: { status: 'APPROVED' },
          include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        },
        _count: { select: { products: true } },
      },
    });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const data = { ...req.body };
    delete data.userId;
    delete data.id;
    delete data.totalSales;
    delete data.totalEarnings;
    delete data.totalCommission;
    delete data.totalPayout;
    delete data.pendingPayout;

    if (data.storeName && data.storeName !== vendor.storeName) {
      data.storeSlug = await uniqueSlug(data.storeName, prisma.vendor, 'storeSlug', vendor.id);
    }

    if (req.file) {
      const result = await storage.upload(req.file, 'logos');
      data.storeLogo = result.url;
    }

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.myStore = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: { select: { products: true, orders: true, payouts: true } },
      },
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.listPublic = async (req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true, storeName: true, storeSlug: true, storeDescription: true,
        storeLogo: true, verificationBadge: true, city: true, country: true,
        _count: { select: { products: { where: { status: 'APPROVED' } } } },
      },
      orderBy: { storeName: 'asc' },
    });
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};
