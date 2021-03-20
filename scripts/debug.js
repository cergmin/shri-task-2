const fs = require('fs');
const util = require('util');
const prepareData = require('../build/index.js').prepareData;

let input_data = fs.readFileSync(
    './test/input.json',
    {
        encoding:'utf8',
        flag:'r'
    }
);
input_data = JSON.parse(input_data);

try{
    let data = prepareData(input_data, {'sprintId': 977});
    console.log(
        util.inspect(
            data[4],
            {
                showHidden: false,
                depth: null,
                colors: true,
                compact: 3
            }
        )
    );
}
catch(err){
    console.log('\x1b[41m\x1b[37m', 'Ошибка при запуске', '\x1b[0m');
    console.log(err);
}