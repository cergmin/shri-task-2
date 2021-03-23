let sprintsTimestamps = [];
let currSprint;
let sprints = {};
let users = {};
let commits = [];
let summaries = {};

const sprintsDefaultTemplate = {
    name: '',
    commits: 0
};

const userDefaultTemplate = {
    name: '',
    avatar: '',
    commits: 0,
    likes: 0
};

const summariesDefaultTemplate = {
    size: 0
};

// Получить форму множественного числа существительного
function getPluralForm (n, form1, form2, form5) {
    n = Math.abs(n);

    n %= 100;
    if (n > 10 && n < 20) {
        return form5;
    }

    n %= 10;
    if (n > 1 && n < 5) {
        return form2;
    }

    if (n === 1) {
        return form1;
    }

    return form5;
}

// Получить id спринта по временному отрезку
function getSprintId (timestamp) {
    let l = 0;
    let c = 0;
    let r = sprintsTimestamps.length - 1;

    while (r - l > 0) {
        c = Math.floor((r + l + 1) / 2);

        if (sprintsTimestamps[c][0] > timestamp) {
            r = c - 1;
        } else {
            l = c;
        }
    }

    return sprintsTimestamps[r][2];
}

// Принимает на вход id: число, строку или объект
// Возвращает id в виде строки,
// если был получен объект, то о нём записывается информация
function getEntityId (entity) {
    let entityId = entity;

    if (entity instanceof Object) {
        entityId = entity.id;
        writeEntity(entity);
    }

    return entityId.toString();
}

// Добавить/изменить информацию о сущности
// в соответствующую переменную
function writeEntity (entity) {
    if (!(entity instanceof Object)) {
        return;
    }

    switch (entity.type) {
        case 'Commit': {
            const currSprintObj = Object.assign(
                {
                    sprintId: getSprintId(entity.timestamp)
                },
                entity
            );
            commits.push(currSprintObj);

            // Проверяем, относится ли коммит к текущему спринту
            if (currSprintObj.sprintId === currSprint.id) {
                // Получаем id автора
                let authorId = getEntityId(entity.author);

                // Создаём запись о нём, если её ещё нет
                if (!(authorId in users)) {
                    users[authorId] = Object.assign({}, userDefaultTemplate);
                }

                // Увеличиваем значение счётчика коммитов у автора
                users[authorId].commits++;
            }

            sprints[currSprintObj.sprintId].commits++;
            break;
        }
        case 'Comment': {
            // Проверяем, относится ли комментарий к текущему спринту
            if (entity.createdAt >= currSprint.startAt &&
                entity.createdAt <= currSprint.finishAt) {
                // Получаем id автора
                let authorId = getEntityId(entity.author);

                // Создаём запись о нём, если её ещё нет
                if (!(authorId in users)) {
                    users[authorId] = Object.assign({}, userDefaultTemplate);
                }

                // Обновляем значение счётчика лайков у автора
                users[authorId].likes += entity.likes.length;
            }
            break;
        }
        case 'User': {
            let userId = entity.id.toString();

            if (!(userId in users)) {
                users[userId] = Object.assign({}, userDefaultTemplate);
            }

            users[userId].name = entity.name;
            users[userId].avatar = entity.avatar;

            for (let i = 0; i < entity.friends.length; i++) {
                writeEntity(entity.friends[i]);
            }
            break;
        }
        case 'Summary': {
            let summaryId = entity.id.toString();

            if (!(summaryId in summaries)) {
                summaries[summaryId] = Object.assign({}, summariesDefaultTemplate);
            }

            summaries[summaryId].size = entity.added + entity.removed;
            break;
        }
    }
}

function prepareData (entities, params) {
    // Обнуление переменных
    sprintsTimestamps = [];
    sprints = {};
    users = {};
    commits = [];
    summaries = {};

    // Обработка данных
    for (let i = 0; i < entities.length; i++) {
        if (entities[i].type === 'Sprint') {
            let sprintEntity = Object.assign({}, entities[i]);
            sprintEntity.id = sprintEntity.id.toString();

            if (entities[i].id === params.sprintId) {
                currSprint = sprintEntity;
            }

            sprints[sprintEntity.id] = Object.assign({}, sprintsDefaultTemplate);
            sprints[sprintEntity.id].name = sprintEntity.name;

            sprintsTimestamps.push([
                sprintEntity.startAt,
                sprintEntity.finishAt,
                sprintEntity.id.toString()
            ]);
        }
    }

    sprintsTimestamps = sprintsTimestamps.sort((a, b) => {
        return a[0] - b[1];
    });

    for (let i = 0; i < entities.length; i++) {
        writeEntity(entities[i]);
    }

    let usersSortedByCommits = Object.entries(users).sort((a, b) => {
        return b[1].commits - a[1].commits;
    });

    let usersSortedByLikes = Object.entries(users).sort((a, b) => {
        return b[1].likes - a[1].likes;
    });

    let sprintsSortedById = Object.entries(sprints).sort((a, b) => {
        return a[0] - b[0];
    });

    // Вычисление размера каждого коммита текущего спринта
    for (let i = 0; i < commits.length; i++) {
        // Проверяем, что спринт принадлежит
        // текущему или предыдущему спринту
        if (commits[i].sprintId !== currSprint.id &&
            commits[i].sprintId !== (currSprint.id - 1).toString()) {
            continue;
        }

        let commitSize = 0;

        for (let j = 0; j < commits[i].summaries.length; j++) {
            let summaryId = getEntityId(commits[i].summaries[j]);
            commitSize += summaries[summaryId].size;
        }

        commits[i].size = commitSize;
    }

    // Вывод подготовленной для слайдов информации
    let data = [];
    let subdata = {};

    // Карточка: leaders (Больше всего коммитов)
    subdata = {
        alias: 'leaders',
        data: {
            title: 'Больше всего коммитов',
            subtitle: currSprint.name,
            emoji: '👑',
            users: []
        }
    };

    for (let [userId, userObj] of usersSortedByCommits) {
        if (userObj.commits === 0) {
            continue;
        }

        subdata.data.users.push({
            id: Number(userId),
            name: users[userId].name,
            avatar: users[userId].avatar,
            valueText: userObj.commits.toString()
        });
    }

    data.push(subdata);

    // Карточка: vote (Самый внимательный разработчик)
    subdata = {
        alias: 'vote',
        data: {
            title: 'Самый 🔎 внимательный разработчик',
            subtitle: currSprint.name,
            emoji: '🔎',
            users: []
        }
    };

    for (let [userId, userObj] of usersSortedByLikes) {
        if (userObj.likes === 0) {
            continue;
        }

        subdata.data.users.push({
            id: Number(userId),
            name: users[userId].name,
            avatar: users[userId].avatar,
            valueText: userObj.likes.toString() + ' ' +
                getPluralForm(
                    userObj.likes,
                    'голос',
                    'голоса',
                    'голосов'
                )
        });
    }

    data.push(subdata);

    // Карточка: chart (Коммиты)
    subdata = {
        alias: 'chart',
        data: {
            title: 'Коммиты',
            subtitle: currSprint.name,
            values: [],
            users: []
        }
    };

    for (let [sprintId, sprintObj] of sprintsSortedById) {
        let valueObj = {
            title: sprintId.toString(),
            hint: sprintObj.name,
            value: sprintObj.commits
        };

        if (sprintId === currSprint.id) {
            valueObj.active = true;
        }

        subdata.data.values.push(valueObj);
    }

    for (let [userId, userObj] of usersSortedByCommits) {
        if (userObj.commits === 0) {
            continue;
        }

        subdata.data.users.push({
            id: Number(userId),
            name: users[userId].name,
            avatar: users[userId].avatar,
            valueText: userObj.commits.toString()
        });
    }

    data.push(subdata);

    // Карточка: diagram (Размер коммитов)
    let diagramCategoryBreakpoints = [0, 100, 500, 1000];
    let currCommitsAmount = sprints[currSprint.id].commits;

    let prevCommitsAmount = 0;
    if ((currSprint.id - 1) in sprints) {
        prevCommitsAmount = sprints[(currSprint.id - 1).toString()].commits;
    }

    let commitsAmountDiff = currCommitsAmount - prevCommitsAmount;
    let totalText = currCommitsAmount + ' ' + getPluralForm(
        currCommitsAmount,
        'коммит',
        'коммита',
        'коммитов'
    );

    let differenceText = (commitsAmountDiff > 0 ? '+' : '') +
        commitsAmountDiff + ' с прошлого спринта';

    // Получаем вспомогательный массив с информацией о каждой категории
    let categoriesData = [];
    for (let i = diagramCategoryBreakpoints.length - 1; i >= 0; i--) {
        let dataObj = {
            minSize: diagramCategoryBreakpoints[i] + 1,
            maxSize: Infinity,
            value: 0,
            prevValue: 0 // Количество коммитов предыдущего спринта
        };

        if (i + 1 < diagramCategoryBreakpoints.length) {
            dataObj.maxSize = diagramCategoryBreakpoints[i + 1];
        }

        categoriesData.push(dataObj);
    }

    for (let commit of commits) {
        // Проверяем, что коммит принадлежит
        // текущему или предыдущему спринту
        if (commit.sprintId !== currSprint.id &&
            commit.sprintId !== (currSprint.id - 1).toString()) {
            continue;
        }

        let commitCategory = 0;

        // Определяем категорию коммита
        for (let i = 0; i < categoriesData.length; i++) {
            if (categoriesData[i].minSize <= commit.size &&
                categoriesData[i].maxSize >= commit.size) {
                commitCategory = i;
            }
        }

        if (commit.sprintId === currSprint.id) {
            categoriesData[commitCategory].value++;
        } else {
            categoriesData[commitCategory].prevValue++;
        }
    }

    categoriesData = categoriesData.map((data) => {
        let newData = {};

        if (data.maxSize === Infinity) {
            newData.title = '> ' + data.minSize + ' ' +
                getPluralForm(
                    data.minSize,
                    'строки',
                    'строк',
                    'строк'
                );
        } else {
            newData.title = data.minSize + ' — ' +
                data.maxSize + ' ' +
                getPluralForm(
                    data.maxSize,
                    'строка',
                    'строки',
                    'строк'
                );
        }

        newData.valueText = data.value + ' ' +
            getPluralForm(
                data.value,
                'коммит',
                'коммита',
                'коммитов'
            );

        let valueDiff = data.value - data.prevValue;

        newData.differenceText = (valueDiff > 0 ? '+' : '') +
            valueDiff + ' ' +
            getPluralForm(
                valueDiff,
                'коммит',
                'коммита',
                'коммитов'
            );

        return newData;
    });

    subdata = {
        alias: 'diagram',
        data: {
            title: 'Размер коммитов',
            subtitle: currSprint.name,
            totalText: totalText,
            differenceText: differenceText,
            categories: categoriesData
        }
    };

    data.push(subdata);

    // Карточка: activity (Коммиты)
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const timezoneOffset = 60 * 3; // В минутах (UTC +3 Moscow)
    // const timezoneOffset = new Date().getTimezoneOffset();

    let activityData = {};

    // Создаём пустую activityData
    for (let weekday of weekdays) {
        activityData[weekday] = [];

        for (let i = 0; i < 24; i++) {
            activityData[weekday].push(0);
        }
    }

    for (let commit of commits) {
        if (commit.sprintId === currSprint.id) {
            let commitDate = new Date(
                commit.timestamp + timezoneOffset * 60 * 1000
            );

            activityData[
                weekdays[commitDate.getUTCDay()]
            ][
                commitDate.getUTCHours()
            ]++;
        }
    }

    subdata = {
        alias: 'activity',
        data: {
            title: 'Коммиты',
            subtitle: currSprint.name,
            data: activityData
        }
    };

    data.push(subdata);

    return data;
}

module.exports = { prepareData };
