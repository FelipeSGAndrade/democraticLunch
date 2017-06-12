'use strict';

const Boom = require('boom');
const SecurityManager = require('../../libs/securityManager');
const UserRepository = require('./repository');

const createToken = (request) => {

    const email = request.payload.email;
    const password = request.payload.password;

    const encryptedPassword = SecurityManager.sha256(password);

    const filter = {
        email: email
    };

    return UserRepository.findSingle(filter)
      .then((user) => {

          if (!user) {
              return UserRepository.create(email, encryptedPassword);
          }

          if (user.password !== encryptedPassword) {
              throw Boom.unauthorized();
          }

          return user;
      })
      .then((user) => SecurityManager.createJwt(user._id));
};

module.exports = {
    createToken: createToken
};
