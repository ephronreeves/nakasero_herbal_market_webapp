const prisma = require('../config/prisma');

class NotificationService {
  async send({ userId, orderId, type, channel, title, message }) {
    await prisma.notification.create({
      data: { userId, orderId, type, channel, title, message },
    });

    if (channel === 'email') {
      await this.sendEmail(userId, title, message);
    }
  }

  async sendEmail(userId, title, message) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) return;

    console.log(`[EMAIL] To: ${user.email}, Subject: ${title}, Body: ${message}`);
  }

  async sendSMS(phone, message) {
    console.log(`[SMS] To: ${phone}, Message: ${message}`);
  }

  async sendWhatsApp(phone, message) {
    console.log(`[WHATSAPP] To: ${phone}, Message: ${message}`);
  }
}

module.exports = new NotificationService();
