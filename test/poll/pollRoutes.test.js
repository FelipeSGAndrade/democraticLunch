'use strict';

const Promise = require('bluebird');
const Moment = require('moment');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const server = require('../../src/server').server;
const SecurityManager = require('../../src/libs/securityManager');
const UserRepository = require('../../src/resources/user/repository');
const OptionRepository = require('../../src/resources/option/repository');

let token;
let options;

lab.experiment('Poll route', () => {

    lab.beforeEach(() => {

        const email = 'teste@teste.com';
        const encryptedPassword = SecurityManager.sha256('teste123');

        const optionNames = [
            'Restaurante 1',
            'Restaurante 2',
            'Restaurante 3',
            'Restaurante 4',
            'Restaurante 5'
        ];

        return UserRepository.create(email, encryptedPassword)
            .then((user) => {

                token = SecurityManager.createJwt(user._id);
            })
            .then(() => Promise.mapSeries(optionNames, (name) => OptionRepository.create(name)))
            .then((newOptions) => {

                options = newOptions;
            });
    });

    lab.test('Should return poll for date', () => {

        const date = Moment().format('YYYYMMDD');
        const routeOptions = {
            method: 'GET',
            url: `/v1/polls/${date}`,
            headers: {
                authorization: `bearer ${token}`
            }
        };

        return server.inject(routeOptions)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
            });
    });

    lab.test('Should vote on poll', () => {

        const date = Moment().format('YYYYMMDD');
        const routeOptions = {
            method: 'POST',
            url: `/v1/polls/${date}/votes/${options[0]._id}`,
            headers: {
                authorization: `bearer ${token}`
            }
        };

        return server.inject(routeOptions)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
            });
    });

    lab.test('Should close poll', () => {

        const date = Moment().format('YYYYMMDD');
        const routeOptions = {
            method: 'POST',
            url: `/v1/polls/${date}/close`,
            headers: {
                authorization: `bearer ${token}`
            }
        };

        return server.inject(routeOptions)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
            });
    });
});
