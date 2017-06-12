'use strict';

const _ = require('lodash');
const UserRoutes = require('./resources/user/routes');
const PoolRoutes = require('./resources/pool/routes');
const OptionRoutes = require('./resources/option/routes');
const MockRoutes = require('./resources/mock/routes');

const getRoutes = () => {

    const routes = _.concat(
        UserRoutes,
        PoolRoutes,
        OptionRoutes,
        MockRoutes
    );

    return routes;
};

module.exports = {
    getRoutes: getRoutes
};
