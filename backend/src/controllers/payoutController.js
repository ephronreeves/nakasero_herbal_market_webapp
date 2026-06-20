const prisma = require('../config/prisma');
const { logAction } = require('../utils/audit');

exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role === 'VENDOR' && req.vendor) {
      where.vendorId = req.vendor.id;
    }

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        vendor: { select: { id: true, storeName: true, storeSlug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payouts);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { vendorId, amount, notes } = req.body;

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    if (amount > vendor.pendingPayout) {
      return res.status(400).json({ error: 'Amount exceeds pending payout' });
    }

    const commission = (amount * vendor.commissionRate) / 100;
    const netAmount = amount - commission;

    const payout = await prisma.payout.create({
      data: {
        vendorId,
        amount: parseFloat(amount),
        commission,
        netAmount,
        notes,
      },
    });

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        pendingPayout: { decrement: parseFloat(amount) },
      },
    });

    await logAction({
      userId: req.user.id,
      vendorId,
      action: 'PAYOUT_CREATED',
      entity: 'Payout',
      entityId: payout.id,
      description: `Payout of ${amount} created for ${vendor.storeName}`,
    });

    res.status(201).json(payout);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payout = await prisma.payout.findUnique({ where: { id } });
    if (!payout) return res.status(404).json({ error: 'Payout not found' });

    const updateData = { status };
    if (status === 'PAID') {
      updateData.paidAt = new Date();
      await prisma.vendor.update({
        where: { id: payout.vendorId },
        data: {
          totalPayout: { increment: payout.netAmount },
        },
      });
    }

    const updated = await prisma.payout.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
