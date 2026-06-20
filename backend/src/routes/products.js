const { Router } = require('express');
const multer = require('multer');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { getVendor, vendorOwnership } = require('../middleware/vendorIsolation');
const ctrl = require('../controllers/productController');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', optionalAuth, getVendor, ctrl.list);
router.get('/:slug', optionalAuth, ctrl.show);

router.post('/', authenticate, authorize('VENDOR', 'ADMIN'), getVendor, upload.array('images', 10), ctrl.create);
router.put('/:id', authenticate, authorize('VENDOR', 'ADMIN'), getVendor, vendorOwnership('product'), upload.array('images', 10), ctrl.update);
router.delete('/:id', authenticate, authorize('VENDOR', 'ADMIN'), getVendor, vendorOwnership('product'), ctrl.remove);
router.patch('/:id/status', authenticate, authorize('ADMIN'), ctrl.updateStatus);
router.delete('/images/:imageId', authenticate, authorize('VENDOR', 'ADMIN'), ctrl.deleteImage);

module.exports = router;
