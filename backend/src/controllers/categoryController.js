const prisma = require('../config/prisma');
const { uniqueSlug } = require('../utils/slug');

exports.list = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: { where: { status: 'APPROVED' } } } },
        children: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        children: { where: { isActive: true } },
        parent: true,
      },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const slug = await uniqueSlug(req.body.name, prisma.category);
    const category = await prisma.category.create({
      data: { ...req.body, slug },
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.name) {
      data.slug = await uniqueSlug(data.name, prisma.category, 'slug', id);
    }
    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
