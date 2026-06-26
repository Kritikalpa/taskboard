const router            = require('express').Router();
const controller        = require('../controllers/boards.controller');
const boardlistCtrl     = require('../controllers/boardlists.controller');

router.post('/',                  controller.create);
router.get('/',                   controller.getAll);
router.get('/:id',                controller.getOne);
router.put('/:id',                controller.update);
router.delete('/:id',             controller.remove);
router.post('/:id/members',       controller.addMember);
router.delete('/:id/members/:userId', controller.removeMember);
router.post('/:boardId/lists',    boardlistCtrl.create);

module.exports = router;
