const prisma = require('../config/prisma');
const { logAction } = require('../utils/audit');
const notificationService = require('../services/notification');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ED-${timestamp}${random}`;
};

exports.create = async (req, res, next) => {
  try {
    const { items, addressId, notes, deliveryZone, pickupOption } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'APPROVED' },
      include: { vendor: true },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products are unavailable' });
    }

    const vendorGroups = {};
    for (const product of products) {
      if (!vendorGroups[product.vendorId]) {
        vendorGroups[product.vendorId] = [];
      }
      const item = items.find(i => i.productId === product.id);
      vendorGroups[product.vendorId].push({ product, quantity: item.quantity });
    }

    const orders = [];
    for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
      let subtotal = 0;
      const orderItems = [];

      for (const { product, quantity } of vendorItems) {
        const unitPrice = product.discountPrice || product.price;
        const totalPrice = unitPrice * quantity;
        subtotal += totalPrice;
        orderItems.push({ productId: product.id, quantity, unitPrice, totalPrice });

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: { decrement: quantity },
            totalSales: { increment: quantity },
          },
        });
      }

      const commissionRate = vendorItems[0].product.vendor.commissionRate || 10;
      const commissionAmount = (subtotal * commissionRate) / 100;
      const vendorAmount = subtotal - commissionAmount;
      const orderNumber = generateOrderNumber();

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          vendorId,
          addressId: addressId || null,
          status: 'PENDING',
          subtotal,
          deliveryFee: 0,
          total: subtotal,
          commissionRate,
          commissionAmount,
          vendorAmount,
          notes,
          deliveryZone,
          pickupOption: pickupOption || false,
          items: {
            create: orderItems,
          },
        },
        include: { items: { include: { product: true } } },
      });

      orders.push(order);

      await logAction({
        userId: req.user.id,
        vendorId,
        action: 'ORDER_CREATED',
        entity: 'Order',
        entityId: order.id,
        description: `Order ${orderNumber} created`,
      });

      await notificationService.send({
        userId: req.user.id,
        orderId: order.id,
        type: 'ORDER_CREATED',
        channel: 'email',
        title: 'Order Placed',
        message: `Your order ${orderNumber} has been placed successfully.`,
      });
    }

    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json({ orders });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};

    if (req.user.role === 'CUSTOMER') {
      where.userId = req.user.id;
    } else if (req.user.role === 'VENDOR' && req.vendor) {
      where.vendorId = req.vendor.id;
    }

    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
          payment: { select: { status: true, transactionId: true, provider: true } },
          vendor: { select: { id: true, storeName: true, storeSlug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } } },
        payment: true,
        vendor: { select: { id: true, storeName: true, storeSlug: true } },
        address: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'VENDOR' && order.vendorId !== req.vendor?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validTransitions = {
      PENDING: ['PAID', 'CANCELLED'],
      PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
      PROCESSING: ['PACKED', 'CANCELLED'],
      PACKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role === 'VENDOR' && order.vendorId !== req.vendor?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    const updateData = { status };
    if (status === 'PAID') updateData.paidAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();
    if (status === 'REFUNDED') updateData.refundedAt = new Date();

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    await logAction({
      userId: req.user.id,
      vendorId: req.vendor?.id,
      action: 'ORDER_STATUS_CHANGED',
      entity: 'Order',
      entityId: id,
      description: `Order ${order.orderNumber} status changed to ${status}`,
    });

    await notificationService.send({
      userId: order.userId,
      orderId: id,
      type: 'ORDER_STATUS',
      channel: 'email',
      title: 'Order Update',
      message: `Your order ${order.orderNumber} is now ${status}.`,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.track = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      select: {
        orderNumber: true, status: true, createdAt: true,
        paidAt: true, deliveredAt: true, cancelledAt: true,
        deliveryStatus: true, trackingNumber: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};
