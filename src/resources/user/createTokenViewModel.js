'use strict';

const Joi = require('joi');

const request = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
}).meta({
    className: 'Create Token Payload'
});

const response = Joi.object({
    token: Joi.string().required()
}).meta({
    className: 'Create Token Response'
});

const toViewModel = (result) => {

    return {
        token: result
    };
};

module.exports = {
    request: request,
    response: response,
    toViewModel: toViewModel
};
