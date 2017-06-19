'use strict';

const SecurityManager = require('../../libs/securityManager');
const Moment = require('moment');
const Promise = require('bluebird');

const UserRepository = require('../user/repository');
const PollRepository = require('../poll/repository');
const OptionsRepository = require('../option/repository');

const startMock = (request) => {

    const optionNames = [
        'Restaurante 1',
        'Restaurante 2',
        'Restaurante 3',
        'Restaurante 4',
        'Restaurante 5'
    ];

    return UserRepository.create('teste@email.com', SecurityManager.sha256('password'))
        .then(() =>

            Promise.all([
                Promise.mapSeries(optionNames, createOption),
                PollRepository.create(Moment().add(1, 'day').format('YYYYMMDD'))
            ])
        )
        .spread((options, poll) => {

            poll.votes = [{
                optionId: options[1]._id,
                optionName: options[1].name,
                votes: 3
            }];

            poll.winner = poll.votes[0];
            poll.closed = true;

            return PollRepository.update(poll);
        });
};

const createOption = (name) => {

    return OptionsRepository.create(name);
};

module.exports = {
    startMock: startMock
};
