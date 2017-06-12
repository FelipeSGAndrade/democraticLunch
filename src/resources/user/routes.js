'use strict';

const Controller = require('./controller');
const CreateTokenViewModel = require('./createTokenViewModel');

const createToken = {
    path: '/v1/user/token',
    method: 'POST',
    config: {
        tags: ['api', 'user'],
        description: 'Create user token through email and password',
        notes: 'Create user token through email and password',
        handler: (request, reply) => {

            Controller.createToken(request)
              .then((result) => reply(CreateTokenViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            payload: CreateTokenViewModel.request
        },
        response: {
            schema: CreateTokenViewModel.response
        }
    }
};

const routes = [
    createToken
];

module.exports = routes;
