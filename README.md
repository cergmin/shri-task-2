## Алгоритм
У нас есть 6 переменных, которые хранят информацию о различных объектах. По входным данным мы проходим полностью только два раза и заполняем эти переменные, чтобы потом можно было быстрее и удобнее анализировать сущности из Code Hub. Первый проход нужен, чтобы заполнить информацию про спринты и их временные отрезки, второй, чтобы заполнить всю остальную информацию.

1. **sprintsTimestamps** - это массив, в котором хранится id, время начала и время конца спринтов в упорядоченном виде. Это позволяет использовать бинарный поиск, когда мы хотим определить к какому спринту принадлежит сущность, зная только временной отрезок. Такой поиск осуществляется в функции ``getSprintId(timestamp)``.
2. **sprints** - это объект, в котором по id хранятся клонированные (т.е. не связанные с исходными данными) объекты спринтов. Также там хранится количество коммитов, которые были сделаны во время этого спринта.
3. **currSprint** - это переменная, которая отдельно хранит объект текущего спринта, потому что очень часто нужно иметь доступ к его id или временному отрезку.
4. **users** - это объект, в котором по id хранится различная информация о пользователях: имя, фотография, количество коммитов и количество лайков.
5. **commits** - это массив, в котором хранятся все коммиты.
6. **summaries** - это объект, в котором по id хранятся размеры файлов.

Также, есть функция ``writeEntity(entity)``, которая принимает на вход объект и заполняет переменные, описанные выше. Они может рекурсивно вызвать сама себя, если на вход к ней подаётся объект, в котором есть другой объект/объекты.

Если мы подаём в неё коммит, то она добавляет его в ``commits``, а также прибавляет единицу к количеству коммитов автора и спринта.
Если на вход подаётся комментарий, то мы определяем, относится ли он к текущему спринту и если да, то прибавляем количество лайков этого комментария к счётчику лайков автора.
Если на вход подаётся пользователь, то мы записываем его в ``users`` и вызываемся рекурсивно по всем его друзьям.
Если на вход подаётся файл, то мы записываем его размер в ``summaries``.

После записи информации, создаются три отсортированных массива (пользователей по лайкам, пользователей по коммитам, спринтов по коммитам), обрабатываются небольшие кусочки данных и затем всё выводится.

## ЕSLint
В проекте используется ESLint для сохранения удобочитаемости кода и сохранения его стили в том виде, который принят в индустрии. За основу были взяты рекомендации от [Standard JS](https://standardjs.com/), но с некоторыми изменениями:
```js
rules: {
    indent: ['error', 4, { SwitchCase:  1 }],
    semi: ['error', 'always'],
    'prefer-const':  'off'
}
```

## Автотесты
Для написания автотестов использовались две дополнительные библиотеки: moach и chai. Они достаточно известные и распространённые, благодаря чему, в них, скорее всего, будет меньше ошибок чем в самописном или ином решении, что очень важно для тестов. Также они помогли очень сильно ускорить покрытие кода различными проверками.
Всего было написано 23 теста, их можно запустить командой ``npm test``:

**Module check**
- should export prepareData function (49ms)
- prepareData should return an array for sprint #958
- prepareData should return an array for sprint #975
- prepareData should return an array for sprint #976
- prepareData should return an array for sprint #977
- prepareData should return an array for sprint #996
- prepareData should return exactly 5 cards for any sprint
- prepareData should always return same cards for same input data

**Checking result for the sprint #977**
- card №1 should match to the sample: leaders (Больше всего коммитов)
- card №2 should match to the sample: vote (Самый внимательный разработчик)
- card №3 should match to the sample: chart (Коммиты)
- card №4 should match to the sample: diagram (Размер коммитов)
- card №5 should match to the sample: activity (Коммиты)

 **Checking result for the sprint #981**
- differenceText in diagram card should have '-' before negative values
- differenceText in diagram card should have '+' before positive values
- differenceText in diagram card should have no sign before zero values

**Checking result for the sprint #990**
- All users in the leaders card should have at least 1 commit
- All users in the chart card should have at least 1 commit

**Checking result for the sprint #996 (empty sprint)**
- Cards should have subtitle with sprint name
- Users array should be empty in the leaders card
- Users array should be empty in the vote card
- Users array should be empty in the chart card
- Activity card should have zero activity

## Debug
Есть файл ``debug.js`` и команда ``npm run debug``, которая его запускает. На протяжении всей разработки скрипт использовался для вывода в различных формах результата работы функции ``prepareData(entities, params)``. 