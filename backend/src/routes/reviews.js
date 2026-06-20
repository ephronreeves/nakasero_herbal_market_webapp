const { Router } = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

const router = Router();

router.get('/product/:productId', optionalAuth, ctrl.list);
router.post('/product/:productId', authenticate, ctrl.create);

module.exports = router;
