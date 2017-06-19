'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Moment = require('moment');

let lastIndex = 0;
let pollList = [];

const find = (filter) => {

    return Promise.resolve(_.filter(pollList, filter));
};

const findSingle = (filter) => {

    return Promise.resolve(_.find(pollList, filter));
};

const update = (poll) => {

    const index = _.findIndex(pollList, { _id: poll._id });

    if (index === -1) {
        return Promise.resolve(null);
    }

    pollList[index] = poll;
    return Promise.resolve(poll);
};

const create = (date) => {

    const poll = {
        _id: lastIndex++,
        date: date,
        week: Moment(date).isoWeek(),
        votes: [],
        usersVoted: [],
        winner: null,
        closed: false
    };

    pollList.push(poll);
    return Promise.resolve(poll);
};

const clear = () => {

    pollList = [];
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
