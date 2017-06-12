'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Moment = require('moment');

let lastIndex = 0;
let poolList = [];

const find = (filter) => {

    return Promise.resolve(_.filter(poolList, filter));
};

const findSingle = (filter) => {

    return Promise.resolve(_.find(poolList, filter));
};

const update = (pool) => {

    const index = _.findIndex(poolList, { _id: pool._id });

    if (index === -1) {
        return Promise.resolve(null);
    }

    poolList[index] = pool;
    return Promise.resolve(pool);
};

const create = (date) => {

    const pool = {
        _id: lastIndex++,
        date: date,
        week: Moment(date).isoWeek(),
        votes: [],
        usersVoted: [],
        winner: null,
        closed: false
    };

    poolList.push(pool);
    return Promise.resolve(pool);
};

const clear = () => {

    poolList = [];
    lastIndex = 0;

    return Promise.resolve();
};

module.exports = {
    find: find,
    findSingle: findSingle,
    update: update,
    create: create,
    clear: clear
};
