const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/wishlistController');

const router = Router();

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, ctrl.add);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
