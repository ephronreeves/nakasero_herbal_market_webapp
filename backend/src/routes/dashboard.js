const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = Router();

router.get('/vendor', authenticate, authorize('VENDOR'), ctrl.vendorDashboard);
router.get('/admin', authenticate, authorize('ADMIN'), ctrl.adminDashboard);

module.exports = router;
