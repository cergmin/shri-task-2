const fs = require('fs');
const prepareData = require('../build/index.js').prepareData;

function compareObject(x, y) {
    if(x === null || x === undefined || y === null || y === undefined){
        return x === y;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x instanceof Function) {
        return x === y;
    }

    if (x === y || x.valueOf() === y.valueOf()) {
        return true;
    }

    if (Array.isArray(x) && x.length !== y.length) {
        return false;
    }

    if(!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    var p = Object.keys(x);
    return Object.keys(y).every(function (i) {
        return p.indexOf(i) !== -1;
    }) &&
    p.every(function (i) {
        return compareObject(x[i], y[i]);
    });
}

let input_data = fs.readFileSync(
    './tests/input.json',
    {
        encoding:'utf8',
        flag:'r'
    }
);
input_data = JSON.parse(input_data);

let output_data = fs.readFileSync(
    './tests/output.json',
    {
        encoding:'utf8',
        flag:'r'
    }
);
output_data = JSON.parse(output_data);

try{
    let data = prepareData(input_data, {'sprintId': 977});

    if(data.length > output_data.length){
        console.log('\x1b[43m\x1b[30m', 'Выходных данных больше чем нужно', '\x1b[0m');
    }

    if(data.length < output_data.length){
        console.log('\x1b[43m\x1b[30m', 'Выходных данных меньше чем нужно', '\x1b[0m');
    }

    for(let i = 0; i < output_data.length; i++){
        if(i < data.length && compareObject(output_data[i], data[i])){
            console.log('\x1b[42m\x1b[37m', 'OK', '\x1b[0m');
        }
        else{
            console.log('\x1b[41m\x1b[37m', 'WA', '\x1b[0m');
        }
    }

    console.log(data);
}
catch(err){
    console.log('\x1b[41m\x1b[37m', 'Ошибка при запуске', '\x1b[0m');
    console.log(err);
}