'use strict';

const Moment = require('moment');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const PollRepository = require('../../src/resources/poll/repository');

lab.experiment('Poll repository', () => {

    lab.afterEach(() => {

        return PollRepository.clear();
    });

    lab.test('Should create and return single poll for date', () => {

        const date = Moment().format('YYYYMMDD');

        const expectedResult = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const filter = {
            date: date
        };

        return PollRepository.create(date)
            .then(() => PollRepository.findSingle(filter))
            .then((result) => {

                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return polls for date', () => {

        const date = Moment().format('YYYYMMDD');

        const expectedResult = [{
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        }];

        const filter = {
            date: date
        };

        return PollRepository.create(date)
            .then(() => PollRepository.find(filter))
            .then((result) => {

                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should update poll', () => {

        const date = Moment().format('YYYYMMDD');

        const updatedPoll = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [{
                optionId: 1,
                optionName: 'name',
                votes: 5
            }],
            usersVoted: [1, 2],
            winner: {
                optionId: 1,
                optionName: 'name',
                votes: 5
            },
            closed: true
        };

        const filter = {
            date: date
        };

        return PollRepository.create(date)
            .then(() => PollRepository.update(updatedPoll))
            .then(() => PollRepository.findSingle(filter))
            .then((result) => {

                expect(result).to.equal(updatedPoll);
            });
    });
});
