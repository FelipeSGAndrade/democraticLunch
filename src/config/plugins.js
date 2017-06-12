'use strict';

const Config = require('./config');
const Good = require('./plugins/good');
const Swagger = require('./plugins/swagger');
const SwaggerUi = require('./plugins/swagger-ui');

const UsedList = function () {

    if (Config.isEnvironment('test')) {
        return [
            require('hapi-auth-jwt')
        ];
    }

    return [
        Good,
        require('inert'),
        require('vision'),
        require('hapi-auth-jwt'),
        Swagger,
        SwaggerUi
    ];
};

module.exports = UsedList();
