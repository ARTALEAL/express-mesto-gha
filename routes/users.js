const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { URL_REGEX } = require('../utils/constants');

const {
  createUser,
  getUsersInfo,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  loginUser,
} = require('../controllers/users');

// signIn
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), loginUser);

router.post('/signup', createUser);

router.get('/', getUsersInfo);
router.get('/:id', getUserInfo);

router.patch('/me', setUserInfo);
router.patch('/me/avatar', setUserAvatar);

module.exports = router;
