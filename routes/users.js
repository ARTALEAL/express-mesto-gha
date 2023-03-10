const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
// const { URL_REGEX } = require('../utils/constants');
const InaccurateDataError = require('../errors/InaccurateDataError');

const {
  createUser,
  getUsersInfo,
  getUserInfo,
  getCurrentUserInfo,
  setUserInfo,
  setUserAvatar,
  loginUser,
} = require('../controllers/users');

// // signUp
router.use('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new InaccurateDataError('Не правильный URL');
      }
      return value;
    }),
  }),
}), createUser);

// signIn
router.use('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), loginUser);

router.get('/', getUsersInfo);
router.get('/me', getCurrentUserInfo);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), getUserInfo);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), setUserInfo);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new InaccurateDataError('Не правильный URL');
      }
      return value;
    }),
  }),
}), setUserAvatar);

module.exports = router;
