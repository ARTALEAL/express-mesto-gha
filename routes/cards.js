const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// const { URL_REGEX } = require('../utils/constants');

const {
  receiveCards,
  // createCard,
  likeCard,
  dislikeCard,
  deleteCard,
} = require('../controllers/cards');

// router.post('/', celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().required().min(2).max(30),
//     link: Joi.string()
//       .required()
//       .pattern(URL_REGEX),
//   }),
// }), createCard);

router.get('/', receiveCards);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), dislikeCard);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), deleteCard);

module.exports = router;
