'use strict';

const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const SecurityManager = require('../../src/libs/securityManager');
const UserRepository = require('../../src/resources/user/repository');

const credentials = {
    email: 'teste@teste.com',
    password: 'teste123'
};

lab.experiment('User repository', () => {

    lab.beforeEach(() => {

        return UserRepository.clear();
    });

    lab.test('Should create and return user', () => {

        const encryptedPassword = SecurityManager.sha256(credentials.password);

        const filter = {
            email: credentials.email
        };

        let createdUser;
        return UserRepository.create(credentials.email, encryptedPassword)
            .then((user) => {

                createdUser = user;
            })
            .then(() => UserRepository.findSingle(filter))
            .then((result) => {

                expect(result).to.equal(createdUser);
            });
    });
});
