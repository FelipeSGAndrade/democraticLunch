'use strict';

const _ = require('lodash');
const Moment = require('moment');
const Sinon = require('sinon');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const PollController = require('../../src/resources/poll/controller');
const PollRepository = require('../../src/resources/poll/repository');
const OptionRepository = require('../../src/resources/option/repository');
const sandbox = Sinon.sandbox.create();

lab.experiment('Poll controller', () => {

    lab.beforeEach((done) => {

        sandbox.stub(PollRepository);
        sandbox.stub(OptionRepository);
        done();
    });

    lab.afterEach((done) => {

        sandbox.restore();
        done();
    });

    lab.test('Should return poll for date', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedPollFilter = {
            date: date
        };

        const poll = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const expectedWeekPollFilter = {
            week: poll.week,
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
        }, poll);

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

        const pollWeekFindCall = PollRepository.find
            .withArgs(expectedWeekPollFilter)
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

        return PollController.getPoll(request)
            .then((result) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return new poll for date when not existing', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedFilter = {
            date: date
        };

        const poll = {
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
        }, poll);

        const findCall = PollRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(null));

        const createCall = PollRepository.create
            .withArgs(date)
            .returns(Promise.resolve(poll));

        const pollWeekFindCall = PollRepository.find
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

        return PollController.getPoll(request)
            .then((result) => {

                expect(findCall.calledOnce).to.be.true();
                expect(createCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should not return winning options for the week', () => {

        const userId = 1;
        const yesterday = Moment().add(-1, 'day').format('YYYYMMDD');
        const date = Moment().format('YYYYMMDD');

        const expectedPollFilter = {
            date: date
        };

        const poll = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const expectedWeekPollFilter = {
            week: poll.week,
            closed: true
        };

        const options = [{
            _id: 0,
            name: 'teste'
        },{
            _id: 1,
            name: 'teste2'
        }];

        const existingPolls = [{
            _id: 1,
            date: yesterday,
            week: poll.week, //guarantee same week
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
        }, poll);

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

        const pollWeekFindCall = PollRepository.find
            .withArgs(expectedWeekPollFilter)
            .returns(Promise.resolve(existingPolls));

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

        return PollController.getPoll(request)
            .then((result) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should return canVote = false and empty options for closed poll', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedFilter = {
            date: date
        };

        const poll = {
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
        }, poll);

        const repositoryCall = PollRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(poll));

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

        return PollController.getPoll(request)
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

        const poll = {
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
        }, poll);

        const repositoryCall = PollRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(poll));

        const pollWeekFindCall = PollRepository.find
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

        return PollController.getPoll(request)
            .then((result) => {

                expect(repositoryCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should update poll votes', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPollFilter = {
            date: date
        };

        const poll = {
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

        const updatedPoll = _.cloneDeep(poll);
        updatedPoll.votes.push({
            optionId: optionId,
            optionName: option.name,
            votes: 1
        });
        updatedPoll.usersVoted.push(userId);

        const canVote = false;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: [option]
        }, updatedPoll);

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

        const optionGetByIdCall = OptionRepository.getById
            .withArgs(optionId)
            .returns(Promise.resolve(option));

        const pollUpdateCall = PollRepository.update
            .withArgs(updatedPoll)
            .returns(Promise.resolve(updatedPoll));

        const pollWeekFindCall = PollRepository.find
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

        return PollController.pollVote(request)
            .then((result) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(optionGetByIdCall.calledOnce).to.be.true();
                expect(pollUpdateCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledTwice).to.be.true();
                expect(optionFindCall.calledTwice).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });

    lab.test('Should throw not found when voting on a non existing option', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPollFilter = {
            date: date
        };

        const poll = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: false
        };

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

        const optionGetByIdCall = OptionRepository.getById
            .withArgs(optionId)
            .returns(Promise.resolve(null));

        const pollWeekFindCall = PollRepository.find
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

        return PollController.pollVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(optionGetByIdCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(404);
            });
    });

    lab.test('Should throw a bad request if user already voted on poll', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPollFilter = {
            date: date
        };

        const poll = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [userId],
            winner: null,
            closed: false
        };

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

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

        return PollController.pollVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(400);
            });
    });

    lab.test('Should throw a bad request if poll is closed', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPollFilter = {
            date: date
        };

        const poll = {
            _id: 0,
            date: date,
            week: Moment(date).isoWeek(),
            votes: [],
            usersVoted: [],
            winner: null,
            closed: true
        };

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

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

        return PollController.pollVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(400);
            });
    });

    lab.test('Should throw a bad request if option is not valid for poll', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');
        const optionId = 2;

        const expectedPollFilter = {
            date: date
        };

        const poll = {
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

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

        const optionFindCall = OptionRepository.getById
            .withArgs(optionId)
            .returns(Promise.resolve(option));

        const pollWeekFindCall = PollRepository.find
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

        return PollController.pollVote(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(optionFindCall.calledOnce).to.be.true();
                expect(pollWeekFindCall.calledOnce).to.be.true();
                expect(optionGetAllCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(400);
            });
    });

    lab.test('Should close and update poll', () => {

        const userId = 1;
        const date = Moment().format('YYYYMMDD');

        const expectedPollFilter = {
            date: date
        };

        const poll = {
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

        const updatedPoll = _.cloneDeep(poll);
        updatedPoll.closed = true;
        updatedPoll.winner = poll.votes[1];

        const canVote = false;
        const expectedResult = Object.assign({
            canVote: canVote,
            options: []
        }, updatedPoll);

        const pollFindCall = PollRepository.findSingle
            .withArgs(expectedPollFilter)
            .returns(Promise.resolve(poll));

        const pollUpdateCall = PollRepository.update
            .withArgs(updatedPoll)
            .returns(Promise.resolve(updatedPoll));

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

        return PollController.closePoll(request)
            .then((result) => {

                expect(pollFindCall.calledOnce).to.be.true();
                expect(pollUpdateCall.calledOnce).to.be.true();
                expect(result).to.equal(expectedResult);
            });
    });
});
