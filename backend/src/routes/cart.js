const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

const router = Router();

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, ctrl.add);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.delete('/', authenticate, ctrl.clear);

module.exports = router;
