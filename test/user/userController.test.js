'use strict';

const Sinon = require('sinon');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const SecurityManager = require('../../src/libs/securityManager');
const UserController = require('../../src/resources/user/controller');
const UserRepository = require('../../src/resources/user/repository');
const sandbox = Sinon.sandbox.create();

const credentials = {
    email: 'teste@teste.com',
    password: 'teste123'
};

lab.experiment('User controller', () => {

    lab.beforeEach((done) => {

        sandbox.stub(SecurityManager);
        sandbox.stub(UserRepository);
        done();
    });

    lab.afterEach((done) => {

        sandbox.restore();
        done();
    });

    lab.test('Should return token for user', () => {

        const encryptedPassword = 'encryptedPassword';

        const user = {
            _id: 'newUser',
            password: encryptedPassword
        };

        const token = 'newToken';

        const expectedFilter = {
            email: credentials.email
        };

        const sha256Call = SecurityManager.sha256
            .withArgs(credentials.password)
            .returns(encryptedPassword);

        const repositoryCall = UserRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(user));

        const createJwtCall = SecurityManager.createJwt
            .withArgs(user._id)
            .returns(token);

        const request = {
            payload: credentials
        };

        return UserController.createToken(request)
            .then((result) => {

                expect(sha256Call.calledOnce).to.be.true();
                expect(repositoryCall.calledOnce).to.be.true();
                expect(createJwtCall.calledOnce).to.be.true();
                expect(result).to.equal(token);
            });
    });

    lab.test('Should throw unauthorized if password is wrong', () => {

        const encryptedPassword = 'encryptedPassword';

        const user = {
            _id: 'newUser',
            password: 'another password'
        };

        const expectedFilter = {
            email: credentials.email
        };

        const sha256Call = SecurityManager.sha256
            .withArgs(credentials.password)
            .returns(encryptedPassword);

        const repositoryCall = UserRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(user));

        const request = {
            payload: credentials
        };

        return UserController.createToken(request)
            .then(() => Code.fail('expecting and error'))
            .catch((err) => {

                expect(sha256Call.calledOnce).to.be.true();
                expect(repositoryCall.calledOnce).to.be.true();
                expect(err.isBoom).to.be.true();
                expect(err.output.statusCode).to.equal(401);
            });
    });

    lab.test('Should create new user if not found', () => {

        const encryptedPassword = 'encryptedPassword';

        const user = {
            _id: 'newUser',
            password: encryptedPassword
        };

        const expectedFilter = {
            email: credentials.email
        };

        const token = 'token';

        const sha256Call = SecurityManager.sha256
            .withArgs(credentials.password)
            .returns(encryptedPassword);

        const findCall = UserRepository.findSingle
            .withArgs(expectedFilter)
            .returns(Promise.resolve(null));

        const createCall = UserRepository.create
            .withArgs(credentials.email, encryptedPassword)
            .returns(Promise.resolve(user));

        const createJwtCall = SecurityManager.createJwt
            .withArgs(user._id)
            .returns(token);

        const request = {
            payload: credentials
        };

        return UserController.createToken(request)
            .then((result) => {

                expect(sha256Call.calledOnce).to.be.true();
                expect(findCall.calledOnce).to.be.true();
                expect(createCall.calledOnce).to.be.true();
                expect(createJwtCall.calledOnce).to.be.true();
                expect(result).to.equal(token);
            });
    });
});
