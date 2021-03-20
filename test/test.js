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
    let sprintIdsSelection = [958, 975, 976, 977, 996];
    let sprintResultsSelection = {};

    it('should export prepareData function', function() {
        expect(prepareDataModule).to.have.property('prepareData');
        expect(prepareDataModule.prepareData).to.be.an.instanceof(Function);
    });

    for(let sprintId of sprintIdsSelection){
        it('prepareData should return an array for sprint #' + sprintId, function() {
            sprintResultsSelection[sprintId] = prepareDataModule.prepareData(
                input_data,
                {
                    'sprintId': sprintId
                }
            );
            
            expect(sprintResultsSelection[sprintId]).to.be.an.instanceof(Array);
        });
    }

    it('prepareData should return exactly 5 cards for any sprint', function() {
        for(let sprintId of sprintIdsSelection){
            expect(sprintResultsSelection[sprintId], 'Sprint #' + sprintId).to.have.lengthOf(5);
        }
    });
});

describe('Checking result for the sprint #977', function() {
    this.slow(50);

    let card_names = [
        'leaders (Больше всего коммитов)',
        'vote (Самый внимательный разработчик)',
        'chart (Коммиты)',
        'diagram (Размер коммитов)',
        'activity (Коммиты)'
    ]
    let data = prepareDataModule.prepareData(input_data, {'sprintId': 977});

    for(let i = 0; i < 5; i++){
        it('card №' + (i + 1) + ' should match to the sample: ' + card_names[i], function() {
            expect(data[i]).to.deep.equal(output_data[i]);
        });
    }
});

describe('Checking result for the sprint #976', function() {
    this.slow(50);

    let data = prepareDataModule.prepareData(input_data, {'sprintId': 976});

    it('differenceText in diagram card should have \'-\' before negative values', function() {
        expect(data[3]['data']['categories'][0]['differenceText'][0], '[data][categories][0][differenceText]').to.equal('-');
    });

    it('differenceText in diagram card should have \'+\' before positive values', function() {
        expect(data[3]['data']['differenceText'][0], '[data][differenceText]').to.equal('+');
        expect(data[3]['data']['categories'][1]['differenceText'][0], '[data][categories][1][differenceText]').to.equal('+');
        expect(data[3]['data']['categories'][2]['differenceText'][0], '[data][categories][2][differenceText]').to.equal('+');
        expect(data[3]['data']['categories'][3]['differenceText'][0], '[data][categories][3][differenceText]').to.equal('+');
    });
});