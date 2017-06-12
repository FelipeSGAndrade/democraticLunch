'use strict';

module.exports = {
    register: require('hapi-swaggered-ui'),
    options: {
        title: 'Democratic Lunch Documentation',
        path: '/docs',
        swaggerOptions: {
            validatorUrl: null
        }
    }
};
