'use strict';

const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const Moment = require('moment');
const PollViewModel = require('./pollViewModel');

const params = Joi.object({
    date: Joi.date().format('YYYYMMDD').raw().required().default(Moment().format('YYYYMMDD')),
    optionId: Joi.number().required()
}).meta({
    className: 'Vote Params'
});

const response = PollViewModel.response;

const toViewModel = (result) => PollViewModel.toViewModel(result);

module.exports = {
    params: params,
    response: response,
    toViewModel: toViewModel
};
