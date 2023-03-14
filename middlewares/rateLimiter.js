const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'В данный момент превышено число запросов. Пожалуйста, повторите попытку позже',
});

module.exports = limiter;
