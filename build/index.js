let sprintsTimestamps = [];
let currSprint;
let commits = [];
let users = {};
let usersCommitsAmount = {};
let usersLikesAmount = {};
let sprintsCommitsAmount = {};

function getPluralForm(n, form1, form2, form5){
    n = Math.abs(n);
    
    n %= 100;
    if(n > 10 && n < 20){
        return form5;
    }

    n %= 10;
    if(n > 1 && n < 5){
        return form2;
    }

    if(n == 1){
        return form1;
    }

    return form5;
}

function getSprintId(timestamp){
    let l = 0;
    let c = 0;
    let r = sprintsTimestamps.length - 1;
    
    while(r - l > 0){
        c = Math.floor((r + l + 1) / 2);

        if(sprintsTimestamps[c][0] > timestamp){
            r = c - 1;
        }
        else{
            l = c;
        }
    }

    return sprintsTimestamps[r][2];
}

function addEntity(entity){
    if(!(entity instanceof Object)){
        return;
    }

    switch(entity['type']){
        case 'Commit':
            if(entity['timestamp'] >= currSprint['startAt'] &&
                entity['timestamp'] <= currSprint['finishAt']){
                    commits.push(entity);
                    
                    let authorId = entity['author'];
                    if(entity['author'] instanceof Object){
                        authorId = entity['author']['id'];
                        addEntity(entity['author']);
                    }
                    
                    if(authorId in usersCommitsAmount){
                        usersCommitsAmount[authorId]++;
                    }
                    else{
                        usersCommitsAmount[authorId] = 1;
                    }
            }

            let sprintId = getSprintId(entity['timestamp']);
            if(sprintId in sprintsCommitsAmount){
                sprintsCommitsAmount[sprintId]++;
            }
            else{
                sprintsCommitsAmount[sprintId] = 1;
            }
            break;
        case 'Comment':
            if(entity['createdAt'] >= currSprint['startAt'] &&
                entity['createdAt'] <= currSprint['finishAt']){
                    let authorId = entity['author'];
                    if(entity['author'] instanceof Object){
                        authorId = entity['author']['id'];
                        addEntity(entity['author']);
                    }
                    
                    if(authorId in usersLikesAmount){
                        usersLikesAmount[authorId] += entity['likes'].length;
                    }
                    else{
                        usersLikesAmount[authorId] = entity['likes'].length;
                    }
            }
            break;
        case 'User':
            users[entity['id']] = entity;

            for(let i = 0; i < entity['friends'].length; i++){
                addEntity(entity['friends'][i]);
            }
            break;
    }
}

function prepareData(entities, params){
    // Обработка данных
    for(let i = 0; i < entities.length; i++){
        if(entities[i]['type'] === 'Sprint'){
            if(entities[i]['id'] === params['sprintId']){
                currSprint = entities[i];
            }

            sprintsTimestamps.push([
                entities[i]['startAt'],
                entities[i]['finishAt'],
                entities[i]['id']
            ]);
        }
    }

    sprintsTimestamps = sprintsTimestamps.sort(function(a, b){
        return a[0] - b[1];
    });

    for(let i = 0; i < entities.length; i++){
        addEntity(entities[i]);
    }

    // Вывод информации
    let data = [];
    let subdata = {};

    // "Лидеры по коммитам"
    subdata = {
        'alias': 'leaders',
        'data': {
            'title': 'Больше всего коммитов',
            'subtitle': 'Последний вагон',
            'emoji': '👑',
            'users': []
        }
    };
    for(let [userId, commitsAmount] of Object.entries(usersCommitsAmount).sort(([,a],[,b]) => b-a)){
        subdata['data']['users'].push({
            'id': Number(userId),
            'name': users[userId]['name'],
            'avatar': users[userId]['avatar'],
            'valueText': commitsAmount.toString()
        });
    }
    data.push(subdata);

    // "Самый внимательный разработчик"
    subdata = {
        'alias': 'vote',
        'data': {
            'title': 'Самый 🔎 внимательный разработчик',
            'subtitle': 'Спринт № 213',
            'emoji': '🔎',
            'users': []
        }
    };
    for(let [userId, likesAmount] of Object.entries(usersLikesAmount).sort(([,a],[,b]) => b-a)){
        subdata['data']['users'].push({
            'id': Number(userId),
            'name': users[userId]['name'],
            'avatar': users[userId]['avatar'],
            'valueText': likesAmount.toString() + ' ' +
                getPluralForm(
                    likesAmount,
                    'голос',
                    'голоса',
                    'голосов'
                )
        });
    }
    data.push(subdata);

    return data;
}

module.exports = { prepareData }