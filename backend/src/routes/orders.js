const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getVendor, vendorOwnership } = require('../middleware/vendorIsolation');
const ctrl = require('../controllers/orderController');

const router = Router();

router.post('/', authenticate, ctrl.create);
router.get('/', authenticate, getVendor, ctrl.list);
router.get('/track/:orderNumber', ctrl.track);
router.get('/:id', authenticate, getVendor, ctrl.show);
router.patch('/:id/status', authenticate, authorize('VENDOR', 'ADMIN'), getVendor, vendorOwnership('order'), ctrl.updateStatus);

module.exports = router;
