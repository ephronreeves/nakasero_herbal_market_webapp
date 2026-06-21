const prisma = require('../config/prisma');
const { logAction } = require('../utils/audit');
const notificationService = require('../services/notification');

exports.getMethods = async (req, res) => {
  const methods = [
    { id: 'MTN_MOBILE_MONEY', name: 'MTN Mobile Money', type: 'mobile_money', logo: '/api/uploads/logos/mtn-momo-mobile-money.png', enabled: true },
    { id: 'AIRTEL_MONEY', name: 'Airtel Money', type: 'mobile_money', logo: '/api/uploads/logos/airtel-money.jpg', enabled: true },
    { id: 'VISA', name: 'Visa Card', type: 'card', logo: null, enabled: true },
    { id: 'APPLE_PAY', name: 'Apple Pay', type: 'wallet', logo: null, enabled: true },
  ];
  res.json({ methods });
};

exports.initiatePayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, phone, cardDetails } = req.body;

    const validMethods = ['MTN_MOBILE_MONEY', 'AIRTEL_MONEY', 'VISA', 'APPLE_PAY'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    if ((paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') && !phone) {
      return res.status(400).json({ error: 'Phone number is required for mobile money' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment && order.payment.status === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const reference = `ED-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const providerData = {};
    if (phone) providerData.phone = phone;
    if (cardDetails) providerData.cardLastFour = cardDetails.lastFour;

    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        provider: paymentMethod,
        reference,
        amount: order.total,
        status: 'PENDING',
        providerData,
        retryCount: { increment: 1 },
      },
      create: {
        orderId: order.id,
        provider: paymentMethod,
        reference,
        amount: order.total,
        status: 'PENDING',
        providerData,
      },
    });

    await logAction({
      userId: req.user.id,
      action: 'PAYMENT_INITIATED',
      entity: 'Payment',
      entityId: payment.id,
      description: `Payment initiated for order ${order.orderNumber} via ${paymentMethod}`,
    });

    const messages = {
      MTN_MOBILE_MONEY: 'Payment initiated. Please check your phone to complete the MTN MoMo transaction.',
      AIRTEL_MONEY: 'Payment initiated. Please check your phone to complete the Airtel Money transaction.',
      VISA: 'Payment initiated. Your Visa card will be charged upon confirmation.',
      APPLE_PAY: 'Payment initiated. Please complete the payment using Apple Pay.',
    };

    res.json({
      payment,
      message: messages[paymentMethod] || 'Payment initiated.',
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

exports.handleCallback = async (req, res, next) => {
  try {
    const { reference, transactionId, status, amount, provider } = req.body;

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const paymentStatus = status === 'SUCCESSFUL' ? 'PAID' : 'FAILED';

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId,
        callbackData: req.body,
        paidAt: paymentStatus === 'PAID' ? new Date() : null,
      },
    });

    if (paymentStatus === 'PAID') {
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
        message: `Payment of UGX ${totalPaid.toLocaleString()} for order ${order.orderNumber} confirmed via ${provider || payment.provider}.`,
      });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

exports.initiateMTNPayment = exports.initiatePayment;
exports.mtnCallback = exports.handleCallback;
