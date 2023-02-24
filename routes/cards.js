const router = require('express').Router();
const {
  receiveCards,
  createCard,
  likeCard,
  dislikeCard,
  deleteCard,
} = require('../controllers/cards');

router.post('/', createCard);

router.get('/', receiveCards);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

router.delete('/:id', deleteCard);

module.exports = router;