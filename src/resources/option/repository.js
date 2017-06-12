'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

let lastIndex = 0;
let optionList = [];

const getAll = () => {

    return optionList;
};

const getById = (optionId) => {

    return Promise.resolve(_.find(optionList, { _id: optionId }));
};

const create = (optionName) => {

    const option = {
        _id: lastIndex++,
        name: optionName
    };

    optionList.push(option);
    return Promise.resolve(option);
};

const clear = () => {

    optionList = [];
    lastIndex = 0;

    return Promise.resolve();
};

module.exports = {
    getAll: getAll,
    getById: getById,
    create: create,
    clear: clear
};
