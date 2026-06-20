const prisma = require('../config/prisma');

exports.list = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
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
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stockQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      const item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: {
          product: {
            include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
          },
        },
      });
      return res.json(item);
    }

    const item = await prisma.cartItem.create({
      data: { userId: req.user.id, productId, quantity },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    if (quantity > item.product.stockQuantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return res.json({ message: 'Item removed' });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};

exports.clear = async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json({ message: 'Cart cleared' });
};
