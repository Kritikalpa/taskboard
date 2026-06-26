const router     = require('express').Router();
const controller = require('../controllers/boardlists.controller');
const cardsCtrl  = require('../controllers/cards.controller');

router.get('/:id',           controller.getOne);
router.put('/:id',           controller.update);
router.delete('/:id',        controller.remove);
router.post('/:listId/cards', cardsCtrl.create);

module.exports = router;
