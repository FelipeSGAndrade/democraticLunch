'use strict';

const Controller = require('./controller');

const startMock = {
    path: '/v1/startMock',
    method: 'POST',
    config: {
        tags: ['api', 'mock'],
        description: 'Create mock values',
        notes: 'Create mock values',
        handler: (request, reply) => {

            Controller.startMock(request)
              .then((result) => reply().code(204))
              .catch((err) => reply(err));
        }
    }
};

const routes = [
    startMock
];

module.exports = routes;
