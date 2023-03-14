const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => isEmail(v),
        message: 'Не корректный email',
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
      // validate: {
      //   validator: ({ length }) => length >= 6,
      //   message: 'Пароль должен быть не менее 6 символов',
      // },
    },

    name: {
      type: String,
      default: 'Жак-Ив Кусто',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Имя пользователя должно быть длиной от 2 до 30 символов',
      },
    },

    about: {
      type: String,
      default: 'Исследователь',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Информация о пользователе должна быть длиной от 2 до 30 символов',
      },
    },

    avatar: {
      type: String,
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: (url) => isURL(url),
        message: 'Требуется ввести URL',
      },
    },
  },
  {
    versionKey: false,
    statics: {
      findUserByCredentials(email, password) {
        return this
          .findOne({ email })
          .select('+password')
          .then((user) => {
            // Если пользователь не найден
            if (!user) {
              throw new UnauthorizedError('Неправильные почта или пароль');
            }
            // Если найден
            return bcrypt.compare(password, user.password).then((matched) => {
              if (!matched) {
                throw new UnauthorizedError('Неправильные почта или пароль');
              }
              return user;
            });
          });
      },
    },
  },
);

module.exports = mongoose.model('user', userSchema);
