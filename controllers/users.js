const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { SECRET_KEY } = require('../utils/constants');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConfilctError');
const InaccurateDataError = require('../errors/InaccurateDataError');

function createUser(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new InaccurateDataError('Переданы некорректные данные при регистрации пользователя'));
  }
  return User.findOne({ email }).then((user) => {
    if (user) {
      next(new ConflictError('Пользователь с таким электронным адресом уже зарегистрирован'));
    }
    return bcrypt.hash(password, 10);
  })
    .then((hash) => User.create({
      email,
      password: hash,
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InaccurateDataError('Переданы некорректные данные пользователя или ссылка на аватар'));
      }
      return next(err);
    });
}

function loginUser(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user || !password) {
        return next(new UnauthorizedError('Неправильные почта или пароль'));
      }
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch(next);
}

function getUsersInfo(req, res, next) {
  User
    .find({})
    .then((users) => res.send({ users }))
    .catch(next);
}

function getUserInfo(req, res, next) {
  const { id } = req.params;

  User
    .findById(id)
    .then((user) => {
      if (user) return res.send({ user });

      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InaccurateDataError('Передан некорректный id'));
      } else {
        next(err);
      }
    });
}

function getCurrentUserInfo(req, res, next) {
  const { _id } = req.user;
  User
    .findById(_id).then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с таким id не найден'));
      }
      return res.send(user);
    }).catch(next);
}

function setUserInfo(req, res, next) {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  ).then((user) => {
    res.send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new InaccurateDataError('Переданы некорректные данные при обновлении профиля пользователя'));
    }
    return next(err);
  });
}

function setUserAvatar(req, res, next) {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  ).then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new InaccurateDataError('Переданы некорректные данные при обновлении профиля пользователя'));
      }
      return next(err);
    });
}

module.exports = {
  createUser,
  loginUser,
  getUsersInfo,
  getUserInfo,
  getCurrentUserInfo,
  setUserInfo,
  setUserAvatar,
};
