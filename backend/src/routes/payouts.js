const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getVendor } = require('../middleware/vendorIsolation');
const ctrl = require('../controllers/payoutController');

const router = Router();

router.get('/', authenticate, getVendor, ctrl.list);
router.post('/', authenticate, authorize('ADMIN'), ctrl.create);
router.patch('/:id', authenticate, authorize('ADMIN'), ctrl.updateStatus);

module.exports = router;
