'use strict';

const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const server = require('../../src/server').server;
const SecurityManager = require('../../src/libs/securityManager');
const UserRepository = require('../../src/resources/user/repository');

let token;

lab.experiment('Option route', () => {

    lab.beforeEach(() => {

        const email = 'teste@teste.com';
        const encryptedPassword = SecurityManager.sha256('teste123');

        return UserRepository.create(email, encryptedPassword)
            .then((user) => {

                token = SecurityManager.createJwt(user._id);
            });
    });

    lab.test('Should create option', () => {

        const routeOptions = {
            method: 'POST',
            url: '/v1/options',
            headers: {
                authorization: `bearer ${token}`
            },
            payload: {
                name: 'optionName'
            }
        };

        return server.inject(routeOptions)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
            });
    });
});
