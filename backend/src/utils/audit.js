const prisma = require('../config/prisma');

const logAction = async ({ userId, vendorId, action, entity, entityId, description, metadata, ipAddress, userAgent }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        vendorId,
        action,
        entity,
        entityId,
        description,
        metadata: metadata || undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { logAction };
