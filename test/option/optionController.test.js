'use strict';

const Sinon = require('sinon');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const OptionController = require('../../src/resources/option/controller');
const OptionRepository = require('../../src/resources/option/repository');
const sandbox = Sinon.sandbox.create();

lab.experiment('Option controller', () => {

    lab.beforeEach((done) => {

        sandbox.stub(OptionRepository);
        done();
    });

    lab.afterEach((done) => {

        sandbox.restore();
        done();
    });

    lab.test('Should create option', () => {

        const userId = 1;
        const optionName = 'optionName';

        const option = {
            _id: 0,
            name: optionName
        };

        const optionCreateCall = OptionRepository.create
            .withArgs(optionName)
            .returns(Promise.resolve(option));

        const request = {
            auth: {
                credentials: {
                    userId: userId
                }
            },
            payload: {
                name: optionName
            }
        };

        return OptionController.createOption(request)
            .then((result) => {

                expect(optionCreateCall.calledOnce).to.be.true();
                expect(result).to.equal(option);
            });
    });
});
