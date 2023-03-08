const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { SECRET_KEY } = require('../utils/constants');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConfilctError');
const InaccurateDataError = require('../errors/InaccurateDataError');

// Old errors delete
const {
  ERROR_INACCURATE_DATA,
  ERROR_NOT_FOUND,
  ERROR_INTERNAL_SERVER,
} = require('../errors/errors');

function createUser(req, res, next) {
  const {
    email, password, name, about, avatar,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name, about, avatar,
    }))
    .then((user) => {
      const { _id } = user;
      return res.status(201).send({
        email, name, about, avatar, _id,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким имейл уже зарегистрирован'));
      } if (err.name === 'ValidationError') {
        next(new InaccurateDataError('Переданы некорректные данные при регистрации пользователя'));
      } else {
        next(err);
      }
    });
  // User
  //   .create({
  //     email, password, name, about, avatar,
  //   })
  //   .then((user) => res.send({ data: user }))
  //   .catch((err) => (
  //     err.name === 'ValidationError'
  //       ? res.status(ERROR_INACCURATE_DATA).send({ message: 'Переданы некорректные данные при создании пользователя' })
  //       : res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' })
  //   ));
}

function loginUser(req, res, next) {
  const { email, password } = req.body;
  User
    .findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });

        return res.send({ _id: token });
      }
      throw new UnauthorizedError('Неправильные почта или пароль');
    })
    .catch(next);
}

function getUsersInfo(req, res) {
  User
    .find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' }));
}

function getUserInfo(req, res) {
  const { id } = req.params;

  User
    .findById(id)
    .then((user) => {
      if (user) return res.send({ data: user });

      return res.status(ERROR_NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
    })
    .catch((err) => (
      err.name === 'CastError'
        ? res.status(ERROR_INACCURATE_DATA).send({ message: 'Передан некорректный id' })
        : res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' })
    ));
}

function setUserInfo(req, res) {
  const { name, about } = req.body;
  const { _id: userId } = req.user;

  User
    .findByIdAndUpdate(
      userId,
      {
        name,
        about,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (user) return res.send({ data: user });

      return res.status(ERROR_NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_INACCURATE_DATA).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      }

      return res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' });
    });
}

function setUserAvatar(req, res) {
  const { avatar } = req.body;
  const { _id: userId } = req.user;

  User
    .findByIdAndUpdate(
      userId,
      {
        avatar,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (user) return res.send({ data: user });

      return res.status(ERROR_NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_INACCURATE_DATA).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }

      return res.status(ERROR_INTERNAL_SERVER).send({ message: 'На сервере произошла ошибка' });
    });
}

module.exports = {
  createUser,
  loginUser,
  getUsersInfo,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
};
