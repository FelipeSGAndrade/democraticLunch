'use strict';

const Joi = require('joi');

const header = Joi.object({
    authorization: Joi.string().required()
}).unknown()
.meta({
    className: 'Authorization Header'
});

module.exports = {
    header: header
};
