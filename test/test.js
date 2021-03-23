/* eslint-disable no-undef */
const fs = require('fs');
const expect = require('chai').expect;
const prepareDataModule = require('../build/index.js');

let inputData = fs.readFileSync(
    './test/input.json',
    {
        encoding: 'utf8',
        flag: 'r'
    }
);
inputData = JSON.parse(inputData);

let outputData = fs.readFileSync(
    './test/output.json',
    {
        encoding: 'utf8',
        flag: 'r'
    }
);
outputData = JSON.parse(outputData);

describe('Module check', function () {
    let sprintIdsSelection = [958, 975, 976, 977, 996];
    let sprintResultsSelection = {};

    it('should export prepareData function', function () {
        expect(prepareDataModule).to.have.property('prepareData');
        expect(prepareDataModule.prepareData).to.be.an.instanceof(Function);
    });

    for (let sprintId of sprintIdsSelection) {
        it('prepareData should return an array for sprint #' + sprintId, function () {
            sprintResultsSelection[sprintId] = prepareDataModule.prepareData(
                inputData,
                {
                    sprintId: sprintId
                }
            );

            expect(
                sprintResultsSelection[sprintId]
            ).to.be.an.instanceof(Array);
        });
    }

    it('prepareData should return exactly 5 cards for any sprint', function () {
        for (let sprintId of sprintIdsSelection) {
            expect(
                sprintResultsSelection[sprintId],
                'prepareData should return 5 cards for sprint #'
            ).to.have.lengthOf(5);
        }
    });

    it('prepareData should always return same cards for same input data', function () {
        let cards1 = sprintResultsSelection[976];
        let cards2 = prepareDataModule.prepareData(inputData, { sprintId: 976 });
        let cards3 = prepareDataModule.prepareData(inputData, { sprintId: 976 });

        expect(
            cards1,
            'Compare the 1st and 2nd calls of prepareData for sprint #976'
        ).to.deep.equal(cards2);

        expect(
            cards1,
            'Compare the 1st and 3rd calls of prepareData for sprint #976'
        ).to.deep.equal(cards3);
    });
});

describe('Checking result for the sprint #977', function () {
    let cardNames = [
        'leaders (Больше всего коммитов)',
        'vote (Самый внимательный разработчик)',
        'chart (Коммиты)',
        'diagram (Размер коммитов)',
        'activity (Коммиты)'
    ];
    let data = prepareDataModule.prepareData(inputData, { sprintId: 977 });

    for (let i = 0; i < 5; i++) {
        it('card №' + (i + 1) + ' should match to the sample: ' + cardNames[i], function () {
            expect(data[i]).to.deep.equal(outputData[i]);
        });
    }
});

describe('Checking result for the sprint #981', function () {
    let data = prepareDataModule.prepareData(inputData, { sprintId: 981 });

    it('differenceText in diagram card should have \'-\' before negative values', function () {
        expect(
            data[3].data.categories[2].differenceText[0],
            'Check for \'-\' in data.categories[2].differenceText[0]'
        ).to.equal('-');
    });

    it('differenceText in diagram card should have \'+\' before positive values', function () {
        expect(
            data[3].data.differenceText[0],
            'data.differenceText[0]'
        ).to.equal('+');

        expect(
            data[3].data.categories[1].differenceText[0],
            'Check for \'+\' in data.categories[1].differenceText[0]'
        ).to.equal('+');

        expect(
            data[3].data.categories[3].differenceText[0],
            'Check for \'+\' in data.categories[3].differenceText[0]'
        ).to.equal('+');
    });

    it('differenceText in diagram card should have no sign before zero values', function () {
        expect(
            data[3].data.categories[0].differenceText[0],
            'Check for \'0\' in data.categories[0].differenceText[0]'
        ).to.equal('0');
    });
});

describe('Checking result for the sprint #990', function () {
    let data = prepareDataModule.prepareData(inputData, { sprintId: 990 });

    it('All users in the leaders card should have at least 1 commit', function () {
        for (let i = 0; i < data[0].data.users.length; i++) {
            expect(
                Number(data[0].data.users[i].valueText)
            ).to.be.at.least(1);
        }
    });

    it('All users in the chart card should have at least 1 commit', function () {
        for (let i = 0; i < data[2].data.users.length; i++) {
            expect(
                Number(data[2].data.users[i].valueText)
            ).to.be.at.least(1);
        }
    });
});

describe('Checking result for the sprint #996 (empty sprint)', function () {
    let data = prepareDataModule.prepareData(inputData, { sprintId: 996 });

    it('Cards should have subtitle with sprint name', function () {
        for (let i = 0; i < 5; i++) {
            expect(
                data[i].data.subtitle,
                'Check subtitle in card №' + (i + 1)
            ).to.equal('Бармалей');
        }
    });

    it('Users array should be empty in the leaders card', function () {
        // eslint-disable-next-line no-unused-expressions
        expect(data[0].data.users).to.be.empty;
    });

    it('Users array should be empty in the vote card', function () {
        // eslint-disable-next-line no-unused-expressions
        expect(data[1].data.users).to.be.empty;
    });

    it('Users array should be empty in the chart card', function () {
        // eslint-disable-next-line no-unused-expressions
        expect(data[2].data.users).to.be.empty;
    });

    it('Activity card should have zero activity', function () {
        const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        for (const weekday of weekdays) {
            expect(data[4].data.data[weekday]).to.be.deep.equal([
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0
            ]);
        }
    });
});
