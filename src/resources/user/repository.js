'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

let lastIndex = 0;
let userList = [];

const findSingle = (filter) => {

    return Promise.resolve(_.find(userList, filter));
};

const create = (email, password) => {

    const user = {
        _id: lastIndex++,
        email: email,
        password: password
    };

    userList.push(user);
    return Promise.resolve(user);
};

const clear = () => {

    userList = [];
    lastIndex = 0;

    return Promise.resolve();
};

module.exports = {
    findSingle: findSingle,
    create: create,
    clear: clear
};
