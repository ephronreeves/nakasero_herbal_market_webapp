const prisma = require('../config/prisma');
const { logAction } = require('../utils/audit');
const notificationService = require('../services/notification');

const MOMO_API_BASE = process.env.MTN_MOMO_ENVIRONMENT === 'production'
  ? 'https://api.mtn.com'
  : 'https://sandbox.momodeveloper.mtn.com';

exports.initiateMTNPayment = async (req, res, next) => {
  try {
    const { orderId, phone } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment && order.payment.status === 'SUCCESSFUL') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const reference = `ED-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        provider: 'mtn_momo',
        reference,
        amount: order.total,
        status: 'PENDING',
        providerData: { phone },
        retryCount: { increment: 1 },
      },
      create: {
        orderId: order.id,
        provider: 'mtn_momo',
        reference,
        amount: order.total,
        status: 'PENDING',
        providerData: { phone },
      },
    });

    await logAction({
      userId: req.user.id,
      action: 'PAYMENT_INITIATED',
      entity: 'Payment',
      entityId: payment.id,
      description: `Payment initiated for order ${order.orderNumber}`,
    });

    res.json({
      payment,
      message: 'Payment initiated. Please check your phone to complete the transaction.',
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.mtnCallback = async (req, res, next) => {
  try {
    const { reference, transactionId, status, amount } = req.body;

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const paymentStatus = status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED';

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId,
        callbackData: req.body,
        paidAt: paymentStatus === 'SUCCESSFUL' ? new Date() : null,
      },
    });

    if (paymentStatus === 'SUCCESSFUL') {
      const order = await prisma.order.findUnique({ where: { id: payment.orderId } });

      const totalPaid = parseFloat(amount) || payment.amount;
      const commissionAmount = (totalPaid * order.commissionRate) / 100;
      const vendorAmount = totalPaid - commissionAmount;

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          commissionAmount,
          vendorAmount,
        },
      });

      await prisma.vendor.update({
        where: { id: order.vendorId },
        data: {
          totalSales: { increment: totalPaid },
          totalEarnings: { increment: vendorAmount },
          totalCommission: { increment: commissionAmount },
          pendingPayout: { increment: vendorAmount },
        },
      });

      await notificationService.send({
        userId: order.userId,
        orderId: payment.orderId,
        type: 'PAYMENT_CONFIRMED',
        channel: 'email',
        title: 'Payment Confirmed',
        message: `Payment of UGX ${totalPaid.toLocaleString()} for order ${order.orderNumber} confirmed.`,
      });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
