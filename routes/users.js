const router = require('express').Router();
const {
  createUser,
  getUsersInfo,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
} = require('../controllers/users');

router.post('/', createUser);

router.get('/', getUsersInfo);
router.get('/:id', getUserInfo);

router.patch('/me', setUserInfo);
router.patch('/me/avatar', setUserAvatar);

module.exports = router;