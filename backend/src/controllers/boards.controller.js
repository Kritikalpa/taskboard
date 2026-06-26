const service = require('../services/boards.service');

async function create(req, res, next) {
  try {
    const { name, privacy } = req.body;
    if (!name) {
      const err = new Error('Board name is required');
      err.status = 400;
      throw err;
    }
    const board = await service.create({ name, privacy });
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const boards = await service.getAll();
    res.json(boards);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const board = await service.getOne(req.params.id);
    res.json(board);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const board = await service.update(req.params.id, req.body);
    res.json(board);
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

async function addMember(req, res, next) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      const err = new Error('user_id is required');
      err.status = 400;
      throw err;
    }
    const member = await service.addMember(req.params.id, user_id);
    res.status(201).json(member || { board_id: Number(req.params.id), user_id });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    await service.removeMember(req.params.id, req.params.userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getOne, update, remove, addMember, removeMember };
