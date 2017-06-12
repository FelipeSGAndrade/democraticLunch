'use strict';

module.exports = {
    register: require('hapi-swaggered'),
    options: {
        tags: [{
            name: 'api',
            description: 'API Endpoints'
        },{
            name: 'user',
            description: 'User and Authentication'
        },{
            name: 'pool',
            description: 'Pool management'
        },{
            name: 'option',
            description: 'Option management'
        },{
            name: 'mock',
            description: 'Test helper'
        }],
        tagging: {
            mode: 'tags'
        },
        info: {
            title: 'Democratic Lunch Documentation',
            version: '1.0'
        }
    }
};
