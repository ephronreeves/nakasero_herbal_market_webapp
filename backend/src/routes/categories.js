const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

const router = Router();

router.get('/', ctrl.list);
router.get('/:slug', ctrl.show);
router.post('/', authenticate, authorize('ADMIN'), ctrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), ctrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.remove);

module.exports = router;
