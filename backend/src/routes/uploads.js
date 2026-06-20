const { Router } = require('express');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/uploadController');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', authenticate, upload.single('file'), ctrl.upload);
router.post('/multiple', authenticate, upload.array('files', 10), ctrl.uploadMultiple);

module.exports = router;
