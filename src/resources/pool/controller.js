'use strict';

const _ = require('lodash');
const Boom = require('boom');
const Promise = require('bluebird');
const PoolRepository = require('./repository');
const OptionRepository = require('../option/repository');

const getPool = (request) => {

    const userId = request.auth.credentials.userId;
    const date = request.params.date;

    const filter = {
        date: date
    };

    return PoolRepository.findSingle(filter)
        .then((pool) => {

            if (!pool) {
                return PoolRepository.create(date);
            }

            return pool;
        })
        .then((pool) => fillPoolUserCanVonte(pool, userId))
        .then((pool) => fillPoolOptions(pool));
};

const poolVote = (request) => {

    const userId = request.auth.credentials.userId;
    const date = request.params.date;
    const optionId = request.params.optionId;

    const filter = {
        date: date
    };

    return PoolRepository.findSingle(filter)
        .then((pool) => {

            if (pool.closed) {
                throw Boom.badRequest('Pool already closed');
            }

            const canVote = verifyUserCanVote(pool, userId);
            if (!canVote) {
                throw Boom.badRequest('User already voted on this pool');
            }

            return setPoolVote(pool, optionId, userId);
        })
        .then((pool) => PoolRepository.update(pool))
        .then((pool) => fillPoolUserCanVonte(pool, userId))
        .then((pool) => fillPoolOptions(pool));
};

const closePool = (request) => {

    const userId = request.auth.credentials.userId;
    const date = request.params.date;

    const filter = {
        date: date
    };

    return PoolRepository.findSingle(filter)
        .then((pool) => {

            const closedPool = Object.assign({}, pool);
            closedPool.closed = true;
            closedPool.winner = _.maxBy(pool.votes, 'votes') || null;

            return PoolRepository.update(closedPool);
        })
        .then((pool) => fillPoolUserCanVonte(pool, userId))
        .then((pool) => fillPoolOptions(pool));
};

const fillPoolUserCanVonte = (pool, userId) => {

    const canVote = verifyUserCanVote(pool, userId);
    return Object.assign({ canVote: canVote }, pool);
};

const verifyUserCanVote = (pool, userId) => {

    let canVote = true;
    if (pool.closed || _.indexOf(pool.usersVoted, userId) > -1) {
        canVote = false;
    }

    return canVote;
};

const setPoolVote = (pool, optionId, userId) => {

    return Promise.all([
        OptionRepository.getById(optionId),
        getPoolValidOptions(pool)
    ])
        .spread((option, validOptions) => {

            if (!option) {
                throw Boom.notFound('Option not found');
            }

            if (validOptions.indexOf(option) === -1) {
                throw Boom.badRequest('Option not valid for pool');
            }

            let vote = _.find(pool.votes, { optionId: optionId });

            if (!vote) {
                vote = {
                    optionId: optionId,
                    optionName: option.name,
                    votes: 0
                };

                pool.votes.push(vote);
            }

            vote.votes++;
            pool.usersVoted.push(userId);

            return pool;
        });
};

const fillPoolOptions = (pool) => {

    if (pool.closed) {
        return Object.assign({ options: [] }, pool);
    }

    return getPoolValidOptions(pool)
        .then((poolOptions) => Object.assign({ options: poolOptions }, pool));
};

const getPoolValidOptions = (pool) => {

    const poolFilter = {
        week: pool.week,
        closed: true
    };

    return Promise.all([
        OptionRepository.getAll(),
        PoolRepository.find(poolFilter)
    ])
        .spread((options, poolList) => {

            const poolOptions = options.filter((option) => {

                const lastWin = _.find(poolList, (currentPool) => currentPool.winner.optionId === option._id);
                return !lastWin;
            });

            return poolOptions;
        });
};

module.exports = {
    getPool: getPool,
    poolVote: poolVote,
    closePool: closePool
};
