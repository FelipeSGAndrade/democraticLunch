'use strict';

const _ = require('lodash');
const Moment = require('moment');
const Sinon = require('sinon');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const PoolController = require('../../src/resources/pool/controller');
const PoolRepository = require('../../src/resources/pool/repository');
const OptionRepository = require('../../src/resources/option/repository');
const sandbox = Sinon.sandbox.create();

lab.experiment('Pool controller', () => {

    lab.beforeEach((done) => {

        sandbox.stub(PoolRepository);
        sandbox.stub(OptionRepository);
        done();
    });

    lab.afterEach((done) => {

        sandbox.restore();
        done();
    });

    lab.test('Should return pool for date', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const expectedWeekPoolFilter = {
            week: pool.week,
            closed: true
        };

        const options = [{
            _id: 0,
            name: 'teste'
        }];

        const canVote = true;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: options
        }, pool);

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const poolWeekFindCall = PoolRepository.find
            .withArgs(expectedWeekPoolFilter)
            .returns(Promise.resolve([]));

        const optionFindCall = OptionRepository.getAll
            .returns(options);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date
            }
        };

        return PoolController.getPool(request)
            .then((result) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return new pool for date when not existing', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const canVote = true;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: []
        }, pool);

        const findCall = PoolRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(null));

        const createCall = PoolRepository.create
            .withArgs(date)
            .returns(Promise.resolve(pool));

        const poolWeekFindCall = PoolRepository.find
            .returns(Promise.resolve([]));

        const optionFindCall = OptionRepository.getAll
            .returns([]);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date
            }
        };

        return PoolController.getPool(request)
            .then((result) => {

                expect(findCall.calledOnce).to.be.true();
                expect(createCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should not return winning options for the week', () => {

        const userId = 1;
        const yesterday = Moment().add(-1, 'day').format('YYYYMMDD');
        const date = Moment().format('YYYYMMDD');

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const expectedWeekPoolFilter = {
            week: pool.week,
            closed: true
        };

        const options = [{
            _id: 0,
            name: 'teste'
        },{
            _id: 1,
            name: 'teste2'
        }];

        const existingPools = [{
            _id: 1,
            date: yesterday,
            week: pool.week, //guarantee same week
            votes: [],
            usersVoted: [],
            winner: {
                optionId: options[0]._id,
                optionName: options[0].name,
                votes: 3
            },
            closed: true
        }];

        const expectedOptions = [
            options[1]
        ];

        const canVote = true;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: expectedOptions
        }, pool);

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const poolWeekFindCall = PoolRepository.find
            .withArgs(expectedWeekPoolFilter)
            .returns(Promise.resolve(existingPools));

        const optionFindCall = OptionRepository.getAll
            .returns(options);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date
            }
        };

        return PoolController.getPool(request)
            .then((result) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return canVote = false and empty options for closed pool', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: true
        };

        const canVote = false;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: []
        }, pool);

        const repositoryCall = PoolRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(pool));

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date
            }
        };

        return PoolController.getPool(request)
            .then((result) => {

                expect(repositoryCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return canVote = false when user already voted', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [1],
            winner: null,
            closed: false
        };

        const canVote = false;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: []
        }, pool);

        const repositoryCall = PoolRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(pool));

        const poolWeekFindCall = PoolRepository.find
            .returns(Promise.resolve([]));

        const optionFindCall = OptionRepository.getAll
            .returns([]);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date
            }
        };

        return PoolController.getPool(request)
            .then((result) => {

                expect(repositoryCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should update pool votes', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const option = {
            _id: optionId,
            name: 'option name'
        };

        const updatedPool = _.cloneDeep(pool);
        updatedPool.votes.push({
            optionId: optionId,
            optionName: option.name,
            votes: 1
        });
        updatedPool.usersVoted.push(userId);

        const canVote = false;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: [option]
        }, updatedPool);

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const optionGetByIdCall = OptionRepository.getById
            .withArgs(optionId)
            .returns(Promise.resolve(option));

        const poolUpdateCall = PoolRepository.update
            .withArgs(updatedPool)
            .returns(Promise.resolve(updatedPool));

        const poolWeekFindCall = PoolRepository.find
            .returns(Promise.resolve([]));

        const optionFindCall = OptionRepository.getAll
            .returns([option]);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date,
                optionId: optionId
            }
        };

        return PoolController.poolVote(request)
            .then((result) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(optionGetByIdCall.calledOnce).to.be.true();
                expect(poolUpdateCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledTwice).to.be.true();
                expect(optionFindCall.calledTwice).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should throw not found when voting on a non existing option', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const optionGetByIdCall = OptionRepository.getById
            .withArgs(optionId)
            .returns(Promise.resolve(null));

        const poolWeekFindCall = PoolRepository.find
            .returns(Promise.resolve([]));

        const optionFindCall = OptionRepository.getAll
            .returns([]);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date,
                optionId: optionId
            }
        };

        return PoolController.poolVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(optionGetByIdCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(404);
            });
    });

    lab.test('Should throw a bad request if user already voted on pool', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [userId],
            winner: null,
            closed: false
        };

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date,
                optionId: optionId
            }
        };

        return PoolController.poolVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(400);
            });
    });

    lab.test('Should throw a bad request if pool is closed', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: true
        };

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date,
                optionId: optionId
            }
        };

        return PoolController.poolVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(400);
            });
    });

    lab.test('Should throw a bad request if option is not valid for pool', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const option = {
            _id: optionId,
            name: 'optionName'
        };

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const optionFindCall = OptionRepository.getById
            .withArgs(optionId)
            .returns(Promise.resolve(option));

        const poolWeekFindCall = PoolRepository.find
            .returns(Promise.resolve([]));

        const optionGetAllCall = OptionRepository.getAll
            .returns([]);

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date,
                optionId: optionId
            }
        };

        return PoolController.poolVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(poolWeekFindCall.calledOnce).to.be.true();
                expect(optionGetAllCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(400);
            });
    });

    lab.test('Should close and update pool', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedPoolFilter = {
            date: date
        };

        const pool = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [{
                optionId: 0,
                optionName: 'option1',
                votes: 2
            },{
                optionId: 1,
                optionName: 'option2',
                votes: 5
            }],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const updatedPool = _.cloneDeep(pool);
        updatedPool.closed = true;
        updatedPool.winner = pool.votes[1];

        const canVote = false;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: []
        }, updatedPool);

        const poolFindCall = PoolRepository.findSingle
            .withArgs(expectedPoolFilter)
            .returns(Promise.resolve(pool));

        const poolUpdateCall = PoolRepository.update
            .withArgs(updatedPool)
            .returns(Promise.resolve(updatedPool));

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            params: {
                date: date
            }
        };

        return PoolController.closePool(request)
            .then((result) => {

                expect(poolFindCall.calledOnce).to.be.true();
                expect(poolUpdateCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });
});
