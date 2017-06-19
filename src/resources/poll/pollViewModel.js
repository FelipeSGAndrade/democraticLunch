'use strict';

const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const Moment = require('moment');
const OptionsViewModel = require('../option/optionViewModel');

const params = Joi.object({
    date: Joi.date().format('YYYYMMDD').raw().required().default(Moment().format('YYYYMMDD'))
}).meta({
    className: 'Get Poll Params'
});

const voteModel = Joi.object({
    optionId: Joi.number().required(),
    optionName: Joi.string().required(),
    votes: Joi.number().required()
});

const response = Joi.object({
    id: Joi.number().required(),
    date: Joi.date().required().example(Moment().format('YYYYMMDD')),
    options: Joi.array().items(OptionsViewModel.response),
    votes: Joi.array().items(voteModel),
    winner: voteModel.allow(null),
    canVote: Joi.boolean().required()
}).meta({
    className: 'Get Poll Response'
});

const toViewModel = (result) => {

    return {
        id: result._id,
        date: result.date,
        options: result.options.map((option) => OptionsViewModel.toViewModel(option)),
        votes: result.votes,
        winner: result.winner,
        canVote: result.canVote
    };
};

module.exports = {
    params: params,
    response: response,
    toViewModel: toViewModel
};
