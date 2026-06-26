const service = require('../services/cards.service');

async function create(req, res, next) {
  try {
    const { name, description, position } = req.body;
    if (!name) {
      const err = new Error('Card name is required');
      err.status = 400;
      throw err;
    }
    const card = await service.create({ name, description, position, board_list_id: req.params.listId });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const card = await service.getOne(req.params.id);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const card = await service.update(req.params.id, req.body);
    res.json(card);
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

async function assign(req, res, next) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      const err = new Error('user_id is required');
      err.status = 400;
      throw err;
    }
    const card = await service.assign(req.params.id, user_id);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function unassign(req, res, next) {
  try {
    const { user_id } = req.body;
    const card = await service.unassign(req.params.id, user_id);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function move(req, res, next) {
  try {
    const { board_list_id } = req.body;
    if (!board_list_id) {
      const err = new Error('board_list_id is required');
      err.status = 400;
      throw err;
    }
    const card = await service.move(req.params.id, board_list_id);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getOne, update, remove, assign, unassign, move };
