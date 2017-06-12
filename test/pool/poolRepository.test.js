'use strict';

const Moment = require('moment');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const PoolRepository = require('../../src/resources/pool/repository');

lab.experiment('Pool repository', () => {

    lab.afterEach(() => {

        return PoolRepository.clear();
    });

    lab.test('Should create and return single pool for date', () => {

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

        return PoolRepository.create(date)
            .then(() => PoolRepository.findSingle(filter))
            .then((result) => {

                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return pools for date', () => {

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

        return PoolRepository.create(date)
            .then(() => PoolRepository.find(filter))
            .then((result) => {

                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should update pool', () => {

        const date = Moment().format('YYYYMMDD');

        const updatedPool = {
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

        return PoolRepository.create(date)
            .then(() => PoolRepository.update(updatedPool))
            .then(() => PoolRepository.findSingle(filter))
            .then((result) => {

                expect(result).to.equal(updatedPool);
            });
    });
});
