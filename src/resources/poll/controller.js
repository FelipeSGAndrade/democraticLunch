'use strict';

const _ = require('lodash');
const Boom = require('boom');
const Promise = require('bluebird');
const PollRepository = require('./repository');
const OptionRepository = require('../option/repository');

const getPoll = (request) => {

    const userId = request.auth.credentials.userId;
    const date = request.params.date;

    const filter = {
        date: date
    };

    return PollRepository.findSingle(filter)
        .then((poll) => {

            if (!poll) {
                return PollRepository.create(date);
            }

            return poll;
        })
        .then((poll) => fillPollUserCanVonte(poll, userId))
        .then((poll) => fillPollOptions(poll));
};

const pollVote = (request) => {

    const userId = request.auth.credentials.userId;
    const date = request.params.date;
    const optionId = request.params.optionId;

    const filter = {
        date: date
    };

    return PollRepository.findSingle(filter)
        .then((poll) => {

            if (poll.closed) {
                throw Boom.badRequest('Poll already closed');
            }

            const canVote = verifyUserCanVote(poll, userId);
            if (!canVote) {
                throw Boom.badRequest('User already voted on this poll');
            }

            return setPollVote(poll, optionId, userId);
        })
        .then((poll) => PollRepository.update(poll))
        .then((poll) => fillPollUserCanVonte(poll, userId))
        .then((poll) => fillPollOptions(poll));
};

const closePoll = (request) => {

    const userId = request.auth.credentials.userId;
    const date = request.params.date;

    const filter = {
        date: date
    };

    return PollRepository.findSingle(filter)
        .then((poll) => {

            const closedPoll = Object.assign({}, poll);
            closedPoll.closed = true;
            closedPoll.winner = _.maxBy(poll.votes, 'votes') || null;

            return PollRepository.update(closedPoll);
        })
        .then((poll) => fillPollUserCanVonte(poll, userId))
        .then((poll) => fillPollOptions(poll));
};

const fillPollUserCanVonte = (poll, userId) => {

    const canVote = verifyUserCanVote(poll, userId);
    return Object.assign({ canVote: canVote }, poll);
};

const verifyUserCanVote = (poll, userId) => {

    let canVote = true;
    if (poll.closed || _.indexOf(poll.usersVoted, userId) > -1) {
        canVote = false;
    }

    return canVote;
};

const setPollVote = (poll, optionId, userId) => {

    return Promise.all([
        OptionRepository.getById(optionId),
        getPollValidOptions(poll)
    ])
        .spread((option, validOptions) => {

            if (!option) {
                throw Boom.notFound('Option not found');
            }

            if (validOptions.indexOf(option) === -1) {
                throw Boom.badRequest('Option not valid for poll');
            }

            let vote = _.find(poll.votes, { optionId: optionId });

            if (!vote) {
                vote = {
                    optionId: optionId,
                    optionName: option.name,
                    votes: 0
                };

                poll.votes.push(vote);
            }

            vote.votes++;
            poll.usersVoted.push(userId);

            return poll;
        });
};

const fillPollOptions = (poll) => {

    if (poll.closed) {
        return Object.assign({ options: [] }, poll);
    }

    return getPollValidOptions(poll)
        .then((pollOptions) => Object.assign({ options: pollOptions }, poll));
};

const getPollValidOptions = (poll) => {

    const pollFilter = {
        week: poll.week,
        closed: true
    };

    return Promise.all([
        OptionRepository.getAll(),
        PollRepository.find(pollFilter)
    ])
        .spread((options, pollList) => {

            const pollOptions = options.filter((option) => {

                const lastWin = _.find(pollList, (currentPoll) => currentPoll.winner.optionId === option._id);
                return !lastWin;
            });

            return pollOptions;
        });
};

module.exports = {
    getPoll: getPoll,
    pollVote: pollVote,
    closePoll: closePoll
};
