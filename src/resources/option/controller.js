'use strict';

const Repository = require('./repository');

const createOption = (request) => {

    const optionName = request.payload.name;

    return Repository.create(optionName);
};

module.exports = {
    createOption: createOption
};
