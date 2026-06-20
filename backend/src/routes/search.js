const { Router } = require('express');
const ctrl = require('../controllers/searchController');

const router = Router();

router.get('/', ctrl.search);
router.get('/suggestions', ctrl.suggestions);

module.exports = router;
