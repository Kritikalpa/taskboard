const service = require('../services/boardlists.service');

async function create(req, res, next) {
  try {
    const { name, position } = req.body;
    if (!name) {
      const err = new Error('List name is required');
      err.status = 400;
      throw err;
    }
    const list = await service.create({ name, board_id: req.params.boardId, position });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const list = await service.getOne(req.params.id);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const list = await service.update(req.params.id, req.body);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getOne, update, remove };
