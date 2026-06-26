const service = require('../services/users.service');

async function create(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      const err = new Error('Name and email are required');
      err.status = 400;
      throw err;
    }
    const user = await service.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const users = await service.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await service.getOne(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getOne };
