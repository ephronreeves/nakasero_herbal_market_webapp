const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = Router();

router.get('/methods', ctrl.getMethods);
router.post('/initiate', authenticate, ctrl.initiatePayment);
router.get('/verify/:orderId', authenticate, ctrl.verifyPayment);
router.post('/callback', ctrl.handleCallback);

router.post('/mtn/initiate', authenticate, ctrl.initiateMTNPayment);
router.post('/mtn/callback', ctrl.mtnCallback);

module.exports = router;
