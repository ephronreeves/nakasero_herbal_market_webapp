const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/vendors', ctrl.getVendors);
router.patch('/vendors/:id', ctrl.updateVendorStatus);
router.get('/products', ctrl.getProducts);
router.get('/orders', ctrl.getOrders);
router.get('/payments', ctrl.getPayments);
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);
router.get('/reviews', ctrl.getReviews);
router.patch('/reviews/:id', ctrl.moderateReview);

module.exports = router;
