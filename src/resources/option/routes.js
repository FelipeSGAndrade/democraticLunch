'use strict';

const Controller = require('./controller');
const AuthorizationViewModel = require('../user/authorizationViewModel');
const OptionViewModel = require('./optionViewModel');

const createOption = {
    path: '/v1/options',
    method: 'POST',
    config: {
        auth: 'token',
        tags: ['api', 'option'],
        description: 'Create new option',
        notes: 'Create new option',
        handler: (request, reply) => {

            Controller.createOption(request)
              .then((result) => reply(OptionViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            headers: AuthorizationViewModel.header,
            payload: OptionViewModel.payload
        },
        response: {
            schema: OptionViewModel.response
        }
    }
};

const routes = [
    createOption
];

module.exports = routes;
