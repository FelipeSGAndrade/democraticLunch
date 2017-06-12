'use strict';

const Joi = require('joi');

const payload = Joi.object({
    name: Joi.string().required()
}).meta({
    className: 'Create Option Payload'
});

const response = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required()
}).meta({
    className: 'Option Response'
});

const toViewModel = (result) => {

    return {
        id: result._id,
        name: result.name
    };
};

module.exports = {
    payload: payload,
    response: response,
    toViewModel: toViewModel
};
