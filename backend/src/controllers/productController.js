const prisma = require('../config/prisma');
const { uniqueSlug } = require('../utils/slug');
const { logAction } = require('../utils/audit');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, vendor, minPrice, maxPrice, status, sort } = req.query;

    const where = {};

    if (req.user?.role === 'VENDOR' && req.vendor) {
      where.vendorId = req.vendor.id;
    } else if (req.user?.role !== 'ADMIN') {
      where.status = 'APPROVED';
    }

    if (category) where.categoryId = category;
    if (vendor) where.vendorId = vendor;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'rating') orderBy = { averageRating: 'desc' };
    if (sort === 'sales') orderBy = { totalSales: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          vendor: { select: { id: true, storeName: true, storeSlug: true, verificationBadge: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
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

exports.show = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        vendor: {
          select: {
            id: true, storeName: true, storeSlug: true, storeDescription: true,
            storeLogo: true, verificationBadge: true, contactEmail: true, contactPhone: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.status !== 'APPROVED' && req.user?.role !== 'ADMIN' && req.user?.role !== 'VENDOR') {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(403).json({ error: 'Vendor profile required' });
    }

    const slug = await uniqueSlug(req.body.name, prisma.product);
    const data = {
      ...req.body,
      slug,
      vendorId: req.vendor.id,
      status: 'PENDING',
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : null,
      stockQuantity: parseInt(req.body.stockQuantity) || 0,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      totalSales: 0,
      averageRating: 0,
    };

    delete data.images;

    const product = await prisma.product.create({ data });

    if (req.files && req.files.length > 0) {
      const storage = require('../services/storage');
      for (let i = 0; i < req.files.length; i++) {
        const result = await storage.upload(req.files[i], 'products');
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: result.url,
            isPrimary: i === 0,
            sortOrder: i,
          },
        });
      }
    }

    await logAction({
      userId: req.user.id,
      vendorId: req.vendor.id,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product.id,
      description: `Created product: ${product.name}`,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.user.role === 'VENDOR' && product.vendorId !== req.vendor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = { ...req.body };
    delete data.images;
    delete data.id;
    delete data.vendorId;
    delete data.slug;

    if (data.price) data.price = parseFloat(data.price);
    if (data.discountPrice) data.discountPrice = parseFloat(data.discountPrice);
    if (data.stockQuantity) data.stockQuantity = parseInt(data.stockQuantity);

    if (req.body.name) {
      data.slug = await uniqueSlug(req.body.name, prisma.product, 'slug', id);
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    if (req.files && req.files.length > 0) {
      const storage = require('../services/storage');
      for (let i = 0; i < req.files.length; i++) {
        const result = await storage.upload(req.files[i], 'products');
        await prisma.productImage.create({
          data: {
            productId: id,
            url: result.url,
            isPrimary: i === 0 && (await prisma.productImage.count({ where: { productId: id } })) === 0,
            sortOrder: i,
          },
        });
      }
    }

    await logAction({
      userId: req.user.id,
      vendorId: req.vendor?.id,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
      description: `Updated product: ${updated.name}`,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.user.role === 'VENDOR' && product.vendorId !== req.vendor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.product.delete({ where: { id } });

    await logAction({
      userId: req.user.id,
      vendorId: req.vendor?.id,
      action: 'PRODUCT_DELETED',
      entity: 'Product',
      entityId: id,
      description: `Deleted product: ${product.name}`,
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isVerified } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(isVerified !== undefined && { isVerified }),
      },
    });

    await logAction({
      userId: req.user.id,
      action: 'PRODUCT_STATUS_CHANGED',
      entity: 'Product',
      entityId: id,
      description: `Changed product ${product.name} status to ${status}`,
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const storage = require('../services/storage');
    await storage.delete(image.url);

    await prisma.productImage.delete({ where: { id: imageId } });

    res.json({ message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
