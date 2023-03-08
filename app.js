const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const routeSignup = require('./routes/users');
const routeSignin = require('./routes/users');

const routeUsers = require('./routes/users');
const routeCards = require('./routes/cards');

const { ERROR_NOT_FOUND } = require('./errors/errors');
const errorHandler = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;
mongoose.set('strictQuery', true);

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '63f8ff39ae83049155aba99d',
  };

  next();
});

app.use('/', routeSignup);
app.use('/', routeSignin);
app.use('/users', routeUsers);
app.use('/cards', routeCards);

app.use((req, res) => {
  res.status(ERROR_NOT_FOUND).send({ message: 'Страницы по запрошенному URL не существует' });
});

app.use(errors());
app.use(errorHandler);

app.listen(PORT);
