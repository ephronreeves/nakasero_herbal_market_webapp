const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = Router();

router.post('/mtn/initiate', authenticate, ctrl.initiateMTNPayment);
router.get('/verify/:orderId', authenticate, ctrl.verifyPayment);
router.post('/mtn/callback', ctrl.mtnCallback);

module.exports = router;
