const prisma = require('../config/prisma');

exports.list = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId: req.params.productId,
        ...(req.user?.role !== 'ADMIN' ? { isApproved: true } : {}),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId: req.user.id } },
    });
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        comment,
        isApproved: false,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      await prisma.product.update({
        where: { id: productId },
        data: { averageRating: Math.round(avgRating * 10) / 10 },
      });
    }

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};
