'use strict';

const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const server = require('../../src/server').server;
const SecurityManager = require('../../src/libs/securityManager');
const UserRepository = require('../../src/resources/user/repository');

const credentials = {
    email: 'teste@teste.com',
    password: 'teste123'
};

lab.experiment('User route', () => {

    lab.beforeEach(() => {

        const encryptedPassword = SecurityManager.sha256(credentials.password);
        return UserRepository.create(credentials.email, encryptedPassword);
    });

    lab.afterEach(() => {

        return UserRepository.clear();
    });

    lab.test('Should return token for user', () => {

        const routeOptions = {
            method: 'POST',
            url: '/v1/user/token',
            payload: credentials
        };

        return server.inject(routeOptions)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
                expect(response.result.token).to.not.be.null();
                expect(response.result.token).to.not.be.undefined();
            });
    });

    lab.test('Should return 401 for user with wrong password', () => {

        const payload = {
            email: credentials.email,
            password: 'wrong'
        };

        const routeOptions = {
            method: 'POST',
            url: '/v1/user/token',
            payload: payload
        };

        return server.inject(routeOptions)
            .then((response) => {

                expect(response.statusCode).to.equal(401);
            });
    });
});
