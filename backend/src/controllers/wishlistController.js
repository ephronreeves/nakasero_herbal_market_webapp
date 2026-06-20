const prisma = require('../config/prisma');

exports.list = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            vendor: { select: { id: true, storeName: true, storeSlug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

exports.add = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) return res.json(existing);

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId },
      include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await prisma.wishlistItem.delete({ where: { id } });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};
