'use strict';

const Controller = require('./controller');
const AuthorizationViewModel = require('../user/authorizationViewModel');
const PollViewModel = require('./pollViewModel');
const VoteViewModel = require('./voteViewModel');

const getPoll = {
    path: '/v1/polls/{date}',
    method: 'GET',
    config: {
        auth: 'token',
        tags: ['api', 'poll'],
        description: 'Get poll by date',
        notes: 'Get poll by date',
        handler: (request, reply) => {

            Controller.getPoll(request)
              .then((result) => reply(PollViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            headers: AuthorizationViewModel.header,
            params: PollViewModel.params
        },
        response: {
            schema: PollViewModel.response
        }
    }
};

const vote = {
    path: '/v1/polls/{date}/votes/{optionId}',
    method: 'POST',
    config: {
        auth: 'token',
        tags: ['api', 'poll'],
        description: 'Vote on a poll by date and option',
        notes: 'Vote on a poll by date and option',
        handler: (request, reply) => {

            Controller.pollVote(request)
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

const closePoll = {
    path: '/v1/polls/{date}/close',
    method: 'POST',
    config: {
        auth: 'token',
        tags: ['api', 'poll'],
        description: 'Close poll by date',
        notes: 'Close poll by date',
        handler: (request, reply) => {

            Controller.closePoll(request)
              .then((result) => reply(PollViewModel.toViewModel(result)))
              .catch((err) => reply(err));
        },
        validate: {
            headers: AuthorizationViewModel.header,
            params: PollViewModel.params
        },
        response: {
            schema: PollViewModel.response
        }
    }
};

const routes = [
    getPoll,
    vote,
    closePoll
];

module.exports = routes;
