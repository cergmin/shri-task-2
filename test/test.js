const fs = require('fs');
const expect = require('chai').expect;
const prepareDataModule = require('../build/index.js');

let input_data = fs.readFileSync(
    './test/input.json',
    {
        encoding:'utf8',
        flag:'r'
    }
);
input_data = JSON.parse(input_data);

let output_data = fs.readFileSync(
    './test/output.json',
    {
        encoding:'utf8',
        flag:'r'
    }
);
output_data = JSON.parse(output_data);

describe('Module check', function() {
    this.slow(500);

    it('should export prepareData function', function() {
        expect(prepareDataModule).to.have.property('prepareData');
        expect(prepareDataModule.prepareData).to.be.an.instanceof(Function);
    });

    it('prepareData should return an array', function() {
        let data = prepareDataModule.prepareData(input_data, {'sprintId': 977})
        expect(data).to.be.an.instanceof(Array);
    });
});

describe('Checking result for Sprint #977', function() {
    this.slow(50);

    let card_names = [
        'leaders (Больше всего коммитов)',
        'vote (Самый внимательный разработчик)',
        'chart (Коммиты)',
        'diagram (Размер коммитов)',
        'activity (Коммиты)'
    ]
    let data = prepareDataModule.prepareData(input_data, {'sprintId': 977});

    it('prepareData should return exactly 5 cards for the sprint', function() {
        expect(data).to.have.lengthOf(5);
    });

    for(let i = 0; i < 5; i++){
        it('card №' + (i + 1) + ' should match to the sample: ' + card_names[i], function() {
            expect(data[i]).to.deep.equal(output_data[i]);
        });
    }
});

describe('Checking result for Sprint #976', function() {
    this.slow(50);

    let data = prepareDataModule.prepareData(input_data, {'sprintId': 976});

    it('prepareData should return exactly 5 cards for the sprint', function() {
        expect(data).to.have.lengthOf(5);
    });

    it('differenceText in diagram card should have \'-\' before negative values', function() {
        expect(data[3]['data']['categories'][0]['differenceText'][0]).to.equal('-');
    });

    it('differenceText in diagram card should have \'+\' before positive values', function() {
        expect(data[3]['data']['differenceText'][0]).to.equal('+');
        expect(data[3]['data']['categories'][1]['differenceText'][0]).to.equal('+');
        expect(data[3]['data']['categories'][2]['differenceText'][0]).to.equal('+');
        expect(data[3]['data']['categories'][3]['differenceText'][0]).to.equal('+');
    });
});