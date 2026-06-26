const router     = require('express').Router();
const controller = require('../controllers/cards.controller');

router.get('/:id',          controller.getOne);
router.put('/:id',          controller.update);
router.delete('/:id',       controller.remove);
router.patch('/:id/assign',   controller.assign);
router.patch('/:id/unassign', controller.unassign);
router.patch('/:id/move',     controller.move);

module.exports = router;
