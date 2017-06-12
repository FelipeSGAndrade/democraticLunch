'use strict';

const Promise = require('bluebird');
const Code = require('code'); // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = Code.expect;

const OptionRepository = require('../../src/resources/option/repository');

lab.experiment('Option repository', () => {

    lab.afterEach(() => {

        return OptionRepository.clear();
    });

    lab.test('Should create and return single option by Id', () => {

        const optionName = 'optionName';

        let createdOption;
        return OptionRepository.create(optionName)
            .then((newOption) => {

                createdOption = newOption;
            })
            .then(() => OptionRepository.getById(createdOption._id))
            .then((result) => {

                expect(result).to.equal(createdOption);
            });
    });

    lab.test('Should return all options', () => {

        const optionNames = [
            'option 1',
            'option 2',
            'option 3'
        ];

        let createdOptions;
        return Promise.mapSeries(optionNames, (name) => OptionRepository.create(name))
            .then((newOptions) => {

                createdOptions = newOptions;
            })
            .then(() => OptionRepository.getAll())
            .then((result) => {

                expect(result).to.equal(createdOptions);
            });
    });
});
