const prisma = require('../config/prisma');

const vendorOwnership = (entityType) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== 'VENDOR') return next();

      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id },
      });

      if (!vendor) {
        return res.status(403).json({ error: 'Vendor profile not found' });
      }

      const entityId = req.params.id || req.params.productId || req.params.orderId;
      if (!entityId) return next();

      let entity;
      switch (entityType) {
        case 'product':
          entity = await prisma.product.findUnique({ where: { id: entityId } });
          if (entity && entity.vendorId !== vendor.id) {
            return res.status(403).json({ error: 'Access denied: this product does not belong to you' });
          }
          break;
        case 'order':
          entity = await prisma.order.findUnique({ where: { id: entityId } });
          if (entity && entity.vendorId !== vendor.id) {
            return res.status(403).json({ error: 'Access denied: this order does not belong to you' });
          }
          break;
        default:
          break;
      }

      req.vendor = vendor;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const getVendor = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id },
      });
      if (!vendor) {
        return res.status(403).json({ error: 'Vendor profile not found' });
      }
      req.vendor = vendor;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { vendorOwnership, getVendor };
