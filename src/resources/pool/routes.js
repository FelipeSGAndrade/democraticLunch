'use strict';

const Controller = require('./controller');
const AuthorizationViewModel = require('../user/authorizationViewModel');
const PoolViewModel = require('./poolViewModel');
const VoteViewModel = require('./voteViewModel');

const getPool = {
    path: '/v1/pools/{date}',
    method: 'GET',
    config: {
        auth: 'token',
        tags: ['api', 'pool'],
        description: 'Get pool by date',
        notes: 'Get pool by date',
        handler: (request, reply) => {

            Controller.getPool(request)
              .then((result) => reply(PoolViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            headers: AuthorizationViewModel.header,
            params: PoolViewModel.params
        },
        response: {
            schema: PoolViewModel.response
        }
    }
};

const vote = {
    path: '/v1/pools/{date}/votes/{optionId}',
    method: 'POST',
    config: {
        auth: 'token',
        tags: ['api', 'pool'],
        description: 'Vote on a pool by date and option',
        notes: 'Vote on a pool by date and option',
        handler: (request, reply) => {

            Controller.poolVote(request)
              .then((result) => reply(VoteViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            headers: AuthorizationViewModel.header,
            params: VoteViewModel.params
        },
        response: {
            schema: VoteViewModel.response
        }
    }
};

const closePool = {
    path: '/v1/pools/{date}/close',
    method: 'POST',
    config: {
        auth: 'token',
        tags: ['api', 'pool'],
        description: 'Close pool by date',
        notes: 'Close pool by date',
        handler: (request, reply) => {

            Controller.closePool(request)
              .then((result) => reply(PoolViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            headers: AuthorizationViewModel.header,
            params: PoolViewModel.params
        },
        response: {
            schema: PoolViewModel.response
        }
    }
};

const routes = [
    getPool,
    vote,
    closePool
];

module.exports = routes;
