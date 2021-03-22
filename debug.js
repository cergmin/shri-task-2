const fs = require('fs');
const util = require('util');
const prepareData = require('./build/index.js').prepareData;

let inputData = fs.readFileSync(
    './test/input.json',
    {
        encoding: 'utf8',
        flag: 'r'
    }
);
inputData = JSON.parse(inputData);

let inpData = inputData.slice();

try {
    let data = prepareData(inputData, { sprintId: 976 });
    console.log(
        util.inspect(
            data,
            {
                showHidden: false,
                depth: null,
                colors: true,
                compact: 3
            }
        )
    );
} catch (err) {
    console.log('\x1b[41m\x1b[37m', 'Ошибка при запуске', '\x1b[0m');
    console.log(err);
}
