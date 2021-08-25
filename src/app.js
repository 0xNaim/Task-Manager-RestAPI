require('dotenv').config();
require('./db/mongoose');
const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

app.use(express.json());

// user and task route
app.use(userRouter);
app.use(taskRouter);

// root route
app.get('/', (req, res) => {
  res.status(200).send('Hello, Express!');
});

module.exports = app;
