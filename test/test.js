const fs = require('fs');
const expect = require('chai').expect;
const prepareData = require('../build/index.js').prepareData;

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

describe('Prepare data for Sprint #977', function() {
    let data = prepareData(input_data, {'sprintId': 977});
    let slide_names = [
        'leaders (Больше всего коммитов)',
        'vote (Самый внимательный разработчик)',
        'chart (Коммиты)',
        'diagram (Размер коммитов)',
        'activity (Коммиты)'
    ]

    for(let i = 0; i < 5; i++){
        it(slide_names[i], function() {
            expect(data[i]).to.deep.equal(output_data[i]);
        });
    }
});