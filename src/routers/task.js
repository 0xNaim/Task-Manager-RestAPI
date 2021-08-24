const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task');

const router = express.Router();

// create a task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//* GET /tasks?completed=true
//* GET /tasks?limit=2&skip=0
//* GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: +req.query.limit,
          skip: +req.query.skip,
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

// find a single task by id
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send('Task not found!');
    }
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// find a task and update
router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send('Invalid update operation!');
  }

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send('Task not found!');
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.status(200).send(task);
  } catch (err) {
    res.status(400).send('Unable to update task!');
  }
});

// delete task by id
router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send('Task not found!');
    }

    res.status(200).send(task);
  } catch (err) {
    res.status(400).send('Unable to delete task!');
  }
});

module.exports = router;
