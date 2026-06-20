const { Router } = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/vendorController');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', ctrl.listPublic);
router.get('/:slug', ctrl.show);

router.post('/register', authenticate, ctrl.register);
router.get('/me/store', authenticate, authorize('VENDOR'), ctrl.myStore);
router.put('/profile', authenticate, authorize('VENDOR'), upload.single('logo'), ctrl.updateProfile);

module.exports = router;
