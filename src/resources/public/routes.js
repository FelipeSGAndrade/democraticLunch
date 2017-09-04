'use strict';

const Path = require('path');

const createToken = {
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
};

const routes = [
    createToken
];

module.exports = routes;
