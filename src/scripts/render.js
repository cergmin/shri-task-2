function renderLeaders(data){
    let layout = '<div class="leaders_list">';

    selectedUserIndex = undefined;
    if(data["selectedUserId"] !== undefined){
        for(let i = 0; i < data["users"].length; i++){
            if(data["users"][i]["id"] == data["selectedUserId"]){
                selectedUserIndex = i;
                break;
            }
        }
    }

    for(let i = 0; i < 5; i++){
        userIndex = [
            (selectedUserIndex === undefined || selectedUserIndex < 4 ? 4 : selectedUserIndex),
            2,
            0,
            1,
            3
        ][i];
        userAvatar = data["users"][userIndex]["avatar"]
        userName = data["users"][userIndex]["name"]
        userScore = data["users"][userIndex]["valueText"]
        userPlace = userIndex + 1
        isUserSelected = data["users"][userIndex]["id"] === data["selectedUserId"]

        layout += `<div class="column${isUserSelected ? ' selected' : ''}" data-place="${userPlace}">
                       <img class="avatar" src="./images/${userAvatar}">`;

        if(userPlace == 1){
            layout += `<div class="emoji">${data["emoji"]}</div>`;
        }
        else if(isUserSelected){
            layout += `<div class="emoji">👍</div>`;
        }

        layout += `    <h3 class="name">${userName}</h3>
                       <h4 class="score">${userScore}</h4>
                       <div class="place_box"></div>
                       <h1 class="place_number">${userPlace}</h1>
                   </div>`;
    }

    layout += '</div>';

    return layout;
}

function renderVote(data, offset=0){
    let layout = "";

    let backButtonDataParams = JSON.stringify({
        alias: 'vote',
        data: {
            offset: Math.max(0, offset - 6)
        }
    });
    let nextButtonDataParams = JSON.stringify({
        alias: 'vote',
        data: {
            offset: Math.min(data["users"].length - 8, offset + 6)
        }
    });

    let canGoBack = (offset == 0);
    let canGoFurther = (offset >= data["users"].length - 8);

    layout += `<div class="grid">
                   <button class="back_button" type="button" ${canGoBack ? "disabled" : ""} data-action="update" data-params='${backButtonDataParams}'></button>`;
    
    for(let i = offset; i < Math.min(data["users"].length, offset + 8); i++){
        let userButtonDataParams = JSON.stringify({
            alias: 'leaders',
            data: {
                selectedUserId: data["users"][i]["id"]
            }
        });

        isSelected = (data["selectedUserId"] == data["users"][i]["id"]);
        
        if(isSelected){
            layout += `<button class="user selected" type="button" disabled>`;
        }
        else{
            layout += `<button class="user" type="button" data-action="update" data-params='${userButtonDataParams}'>`;
        }

        layout += `<img src="./images/${data["users"][i]["avatar"]}" class="avatar">`;

        if(isSelected){
            layout += `<span class="emoji">👍</span>`;
        }

        layout += `    <h3 class="name">${data["users"][i]["name"]}</h3>
                   </button>`;
    }

    layout += `<button class="next_button" type="button" ${canGoFurther ? "disabled" : ""} data-action="update" data-params='${nextButtonDataParams}'></button>`;

    return layout;
}

function renderChart(data){
    let layout = `<div class="columns">`;

    let maxValue = data["values"][0]["value"];
    let activeColumnIndex = data["values"].length - 1;

    for(let i = 0; i < data["values"].length; i++){
        if(data["values"][i]["active"]){
            activeColumnIndex = i;
            maxValue = Math.max(maxValue, data["values"][i]["value"]);
        }
    }

    // Чтобы перед активным стобиком было не больше двух других столбиков
    let maxIndex = Math.min(data["values"].length - 1, activeColumnIndex + 2);

    // Чтобы в DOM добавлялось не больше 50 столбиков
    let minIndex = Math.max(0, maxIndex - 50);

    for(let i = maxIndex; i >= minIndex; i--){
        isActive = Boolean(data["values"][i]["active"]);
        percentage = data["values"][i]["value"] / Math.max(0.0001, maxValue);

        layout += `<div class="column${isActive ? " active" : ""}">
                       ${
                           data["values"][i]["value"] > 0 ?
                           `<h2 class="column_value">${data["values"][i]["value"]}</h2>` :
                           ``
                       }
                       <div class="column_box" style="flex: ${percentage}"></div>
                       <h3 class="column_title">${data["values"][i]["title"]}</h3>
                   </div>`;
    }

    layout += `</div>
               <div class="leaders">
                   <div class="leader">
                       <img class="leader_avatar" src="./images/${data["users"][0]["avatar"]}">
                       <div class="leader_text_block">
                           <h3 class="leader_name">${data["users"][0]["name"]}</h3>
                           <h4 class="leader_score">${data["users"][0]["valueText"]}</h4>
                       </div>
                   </div>
                   <hr>
                   <div class="leader">
                       <img class="leader_avatar" src="./images/${data["users"][1]["avatar"]}">
                       <div class="leader_text_block">
                           <h3 class="leader_name">${data["users"][1]["name"]}</h3>
                           <h4 class="leader_score">${data["users"][1]["valueText"]}</h4>
                       </div>
                   </div>
               </div>`;
    
    return layout;
}

function renderDiagram(data){
    let layout = "";

    // Обрабатываем данные категорий
    let categories = []
    let totalValue = 0;
    
    for(let i = 0; i < data["categories"].length; i++){
        let valueText = data["categories"][i]["valueText"].split(" ", 1);
        let value = Number(valueText.pop());
        let valueUnit = valueText.join(" ");

        let differenceText = data["categories"][i]["differenceText"].split(" ", 1);
        let difference = differenceText.pop();
        let differenceUnit = differenceText.join(" ");

        totalValue += value;

        categories.push({
            "title": data["categories"][i]["title"],
            "value": value,
            "valueUnit": valueUnit,
            "difference": difference,
            "differenceUnit": differenceUnit,
            "percentage": 1 / data["categories"].length
        })
    }

    for(let i = 0; i < categories.length; i++){
        categories[i]["percentage"] = categories[i]["value"] / totalValue;
    }

    console.log(categories);

    // Рендерим svg диаграмму
    const padding = 0;
    const radius = 284 / 2;
    const roundingRadius = 6;
    const innerRadiusK = 0.7;
    const marginDeg = 1.5;

    // Нужен для правильного смещения тени к центру в svg фильтре
    let middleDegree = [];

    let svg_diagram = `<svg class="svg_diagram" width="130" height="130" shape-rendering="geometricPrecision" viewBox="0 0 ${(radius + padding) * 2} ${(radius + padding) * 2}" fill="none" xmlns="http://www.w3.org/2000/svg">`;

    // Центрирование первого сегмента
    let lastEndDeg = 270 - ((360 - marginDeg * categories.length) * categories[0]["percentage"]) / 2 - marginDeg;

    for(let i = 0; i < categories.length; i++){
        let startDeg = lastEndDeg + marginDeg;
        let endDeg = startDeg + (360 - marginDeg * categories.length) * categories[i]["percentage"];

        middleDegree.push((startDeg + endDeg) / 2);

        let cornerOuterDeltaDeg = (roundingRadius * 180) / (Math.PI * radius);
        let cornerInnerDeltaDeg = (roundingRadius * 180) / (Math.PI * radius * innerRadiusK);

        lastEndDeg = endDeg;

        let x = Math.cos((startDeg + cornerOuterDeltaDeg) / 180 * Math.PI) * radius + (radius + padding);
        let y = Math.sin((startDeg + cornerOuterDeltaDeg) / 180 * Math.PI) * radius + (radius + padding);
        
        svg_diagram += `<path fill="url(#diagram_gradient_dark_${i})" filter="url(#diagram_filter_dark_${i})" fill-opacity="0.5" d="M ${x} ${y} `;

        // Точки внешней дуги
        for(let deg = (startDeg + cornerOuterDeltaDeg); deg - 1 < (endDeg - cornerOuterDeltaDeg); deg++){
            // Точно ставим последнюю точку
            // (без погрешности из-за шага в 1 градус)
            if(deg > (endDeg - cornerOuterDeltaDeg)){
                deg = endDeg - cornerOuterDeltaDeg;
            }

            x = Math.cos(deg / 180 * Math.PI) * radius + (radius + padding);
            y = Math.sin(deg / 180 * Math.PI) * radius + (radius + padding);

            svg_diagram += `L ${x} ${y} `;
        }

        // Скругление правого верхнего угла
        x = Math.cos((endDeg - cornerOuterDeltaDeg) / 180 * Math.PI) * (radius - roundingRadius) + (radius + padding);
        y = Math.sin((endDeg - cornerOuterDeltaDeg) / 180 * Math.PI) * (radius - roundingRadius) + (radius + padding);
        xOffset = -Math.sin((endDeg - cornerOuterDeltaDeg) / 180 * Math.PI) * roundingRadius;
        yOffset = Math.cos((endDeg - cornerOuterDeltaDeg) / 180 * Math.PI) * roundingRadius;
        svg_diagram += `
            A 
            ${roundingRadius} ${roundingRadius}
            ${endDeg - cornerOuterDeltaDeg} 0 1
            ${x + xOffset} ${y + yOffset}`;
        
        // Передвижение линии к началу правого нижнего угла
        x = Math.cos(endDeg / 180 * Math.PI) * (radius * innerRadiusK + roundingRadius) + (radius + padding);
        y = Math.sin(endDeg / 180 * Math.PI) * (radius * innerRadiusK + roundingRadius) + (radius + padding);
        svg_diagram += `L ${x} ${y} `;
        
        // Скругление правого нижнего угла
        x = Math.cos(endDeg / 180 * Math.PI) * (radius * innerRadiusK) + (radius + padding);
        y = Math.sin(endDeg / 180 * Math.PI) * (radius * innerRadiusK) + (radius + padding);
        xOffset = -Math.sin((endDeg + 180) / 180 * Math.PI) * roundingRadius;
        yOffset = Math.cos((endDeg + 180) / 180 * Math.PI) * roundingRadius;
        svg_diagram += `
            A 
            ${roundingRadius} ${roundingRadius}
            ${endDeg + 180} 0 1
            ${x + xOffset} ${y + yOffset}`;

        // Точки внутреней дуги
        for(let deg = (endDeg - cornerInnerDeltaDeg); deg + 1 > (startDeg + cornerInnerDeltaDeg); deg--){
            // Точно ставим последнюю точку
            // (без погрешности из-за шага в 1 градус)
            if(deg < startDeg + cornerInnerDeltaDeg){
                deg = startDeg + cornerInnerDeltaDeg;
            }

            x = Math.cos(deg / 180 * Math.PI) * radius * innerRadiusK + (radius + padding);
            y = Math.sin(deg / 180 * Math.PI) * radius * innerRadiusK + (radius + padding);

            svg_diagram += `L ${x} ${y} `;
        }

        // Скругление левого нижнего угла
        x = Math.cos(startDeg / 180 * Math.PI) * (radius * innerRadiusK) + (radius + padding);
        y = Math.sin(startDeg / 180 * Math.PI) * (radius * innerRadiusK) + (radius + padding);
        xOffset = -Math.sin((startDeg + 270) / 180 * Math.PI) * roundingRadius;
        yOffset = Math.cos((startDeg + 270) / 180 * Math.PI) * roundingRadius;
        svg_diagram += `
            A 
            ${roundingRadius} ${roundingRadius}
            ${startDeg + 270} 0 1
            ${x + xOffset} ${y + yOffset}`;
        
        // Передвижение линии к началу левного верхнего угла
        x = Math.cos(startDeg / 180 * Math.PI) * (radius - roundingRadius) + (radius + padding);
        y = Math.sin(startDeg / 180 * Math.PI) * (radius - roundingRadius) + (radius + padding);
        svg_diagram += `L ${x} ${y} `;

        // Скругление левого верхнего угла
        x = Math.cos((startDeg) / 180 * Math.PI) * radius + (radius + padding);
        y = Math.sin((startDeg) / 180 * Math.PI) * radius + (radius + padding);
        xOffset = -Math.sin((startDeg) / 180 * Math.PI) * roundingRadius;
        yOffset = Math.cos((startDeg) / 180 * Math.PI) * roundingRadius;
        svg_diagram += `
            A 
            ${roundingRadius} ${roundingRadius}
            ${startDeg} 0 1
            ${x + xOffset} ${y + yOffset}`;

        svg_diagram += `Z"/>`;
    }

    // Добавляем градиенты и тени к диаграмме
    const filter_expansion = 50; // Процент расширения Bounding Box
    const diagram_appearance = {
        "settings": {
            "background_color": {
                "dark": [17, 15, 11],
                "light": [255, 255, 255]
            },
            "shadow": {
                "spread_radius": 0,
                "blur_radius": 10
            },
            "inset_shadow": {
                "blur_radius": 23
            },
            "inset_light": {
                "x_offset": -1,
                "y_offset": 1,
                "blur_radius": 1.5
            }
        },
        "colors": {
            "dark": [
                {
                    "gradient": [
                        [0.7, [255, 163, 0], 1],
                        [1, [116, 74, 0], 1]
                    ],
                    "shadow": {
                        "color": "rgb(248, 158, 0)",
                        "opacity": 0.1
                    },
                    "inset_shadow": {
                        "color": "rgb(255, 162, 0)",
                        "opacity": 0.9,
                        "offset": -4
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                },
                {
                    "gradient": [
                        [0.7292, [99, 63, 0], 0.1],
                        [1, [15, 9, 0], 0.1]
                    ],
                    "shadow": {
                        "color": "rgb(147, 93, 0)",
                        "opacity": 0.2
                    },
                    "inset_shadow": {
                        "color": "rgb(202, 129, 0)",
                        "opacity": 0.9,
                        "offset": 0
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                },
                {
                    "gradient": [
                        [0.7188, [155, 155, 155], 0.75],
                        [1, [56, 41, 0], 0.75]
                    ],
                    "shadow": {
                        "color": "rgb(0, 0, 0)",
                        "opacity": 0.2
                    },
                    "inset_shadow": {
                        "color": "rgb(139, 139, 139)",
                        "opacity": 0.9,
                        "offset": 0
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                },
                {
                    "gradient": [
                        [0.6, [77, 77, 77], 1],
                        [1, [56, 41, 0], 1]
                    ],
                    "shadow": {
                        "color": "rgb(96, 96, 96)",
                        "opacity": 0.15
                    },
                    "inset_shadow": {
                        "color": "rgb(38, 38, 38)",
                        "opacity": 0.9,
                        "offset": 0
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                }
            ],
            "light": [
                {
                    "gradient": [
                        [0.8125, [255, 184, 0], 0.9],
                        [1, [255, 239, 153], 0.1]
                    ],
                    "shadow": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0
                    },
                    "inset_shadow": {
                        "color": "rgb(255, 176, 57)",
                        "opacity": 0.7,
                        "offset": -2
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                },
                {
                    "gradient": [
                        [0.8125, [255, 184, 0], 0.5],
                        [1, [255, 239, 153], 0.1]
                    ],
                    "shadow": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0
                    },
                    "inset_shadow": {
                        "color": "rgb(255, 176, 57)",
                        "opacity": 0.4,
                        "offset": 0
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                },
                {
                    "gradient": [
                        [0.8281, [166, 166, 166], 0.25],
                        [0.9219, [203, 203, 203], 0.05]
                    ],
                    "shadow": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0
                    },
                    "inset_shadow": {
                        "color": "rgb(105, 105, 105)",
                        "opacity": 0.2,
                        "offset": 0
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                },
                {
                    "gradient": [
                        [0.8281, [191, 191, 191], 0.8],
                        [0.9219, [228, 228, 228], 0.1]
                    ],
                    "shadow": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0
                    },
                    "inset_shadow": {
                        "color": "rgb(131, 131, 131)",
                        "opacity": 0.5,
                        "offset": 0
                    },
                    "inset_light": {
                        "color": "rgb(255, 255, 255)",
                        "opacity": 0.5
                    }
                }
            ]
        }
    }
    svg_diagram += `<defs>`;
    for(let theme_index = 0; theme_index < Object.keys(diagram_appearance["colors"]).length; theme_index++){
        let theme = Object.keys(diagram_appearance["colors"])[theme_index];
        
        for(let i = 0; i < diagram_appearance["colors"][theme].length; i++){
            let offset_x_coeff = -Math.cos(middleDegree[i] / 180 * Math.PI);
            let offset_y_coeff = -Math.sin(middleDegree[i] / 180 * Math.PI);

            svg_diagram += `<radialGradient id="diagram_gradient_${theme}_${i}" spreadMethod="pad" cx="${radius * 2 * 0.4984 + padding}" cy="${radius * 2 * 0.4984 + padding}" fx="${radius * 2 * 0.4984 + padding}" fy="${radius * 2 * 0.5016 + padding}" gradientUnits="userSpaceOnUse">`;

            for(let j = 0; j < diagram_appearance["colors"][theme][i]["gradient"].length; j++){
                let rgb_color = diagram_appearance["colors"][theme][i]["gradient"][j][1];
                let rgb_opacity = diagram_appearance["colors"][theme][i]["gradient"][j][2];
                rgb_color[0] = diagram_appearance["settings"]["background_color"][theme][0] * (1 - rgb_opacity) + rgb_color[0] * rgb_opacity;
                rgb_color[1] = diagram_appearance["settings"]["background_color"][theme][1] * (1 - rgb_opacity) + rgb_color[1] * rgb_opacity;
                rgb_color[2] = diagram_appearance["settings"]["background_color"][theme][2] * (1 - rgb_opacity) + rgb_color[2] * rgb_opacity;
                rgb_color = `rgb(${rgb_color[0]}, ${rgb_color[1]}, ${rgb_color[2]})`;

                svg_diagram += `<stop offset="${diagram_appearance["colors"][theme][i]["gradient"][j][0]}" stop-color="${rgb_color}"/>`;
            }

            svg_diagram += `</radialGradient>`;

            svg_diagram += `<filter id="diagram_filter_${theme}_${i}" x="${-filter_expansion}%" y="${-filter_expansion}%" width="${100 + filter_expansion * 2}%" height="${100 + filter_expansion * 2}%">
                                <feColorMatrix in="SourceAlpha" result="diagram_mask" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4 0"/>

                                <feOffset in="diagram_mask" result="moved_mask" dx="${offset_x_coeff * diagram_appearance["settings"]["shadow"]["spread_radius"]}" dy="${offset_y_coeff * diagram_appearance["settings"]["shadow"]["spread_radius"]}"></feOffset>
                                <feGaussianBlur in="moved_mask" result="blurred_mask" stdDeviation="${diagram_appearance["settings"]["shadow"]["blur_radius"] / 2}"/>
                                <feMorphology in="blurred_mask" result="eroded_mask" operator="erode" radius="${diagram_appearance["settings"]["shadow"]["spread_radius"] / 2}"/>
                                <feFlood flood-color="${diagram_appearance["colors"][theme][i]["shadow"]["color"]}" flood-opacity="${diagram_appearance["colors"][theme][i]["shadow"]["opacity"]}" result="shadow_color"></feFlood>
                                <feComposite in="shadow_color" in2="eroded_mask" operator="in" result="shadow"></feComposite>

                                <feOffset in="diagram_mask" result="moved_mask" dx="${offset_x_coeff * diagram_appearance["colors"][theme][i]["inset_shadow"]["offset"]}" dy="${offset_y_coeff * diagram_appearance["colors"][theme][i]["inset_shadow"]["offset"]}"></feOffset>
                                <feColorMatrix type="matrix" in="moved_mask" result="inverted_mask"
                                    values="1 0 0 0 0 
                                            0 1 0 0 0 
                                            0 0 1 0 0
                                            0 0 0 -1 1"/>
                                <feGaussianBlur in="inverted_mask" result="blurred_mask" stdDeviation="${diagram_appearance["settings"]["inset_shadow"]["blur_radius"] / 2}"/>
                                <feComposite in="blurred_mask" in2="diagram_mask" operator="in" result="inset_shadow_mask"></feComposite>
                                <feColorMatrix in="inset_shadow_mask" result="inset_shadow_mask" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.5 0"/>
                                <feFlood flood-color="${diagram_appearance["colors"][theme][i]["inset_shadow"]["color"]}" flood-opacity="${diagram_appearance["colors"][theme][i]["inset_shadow"]["opacity"]}" result="shadow_color"></feFlood>
                                <feComposite in="shadow_color" in2="inset_shadow_mask" operator="in" result="inset_shadow"></feComposite>

                                <feOffset in="diagram_mask" result="moved_mask" dx="${diagram_appearance["settings"]["inset_light"]["x_offset"]}" dy="${diagram_appearance["settings"]["inset_light"]["y_offset"]}"></feOffset>
                                <feGaussianBlur in="moved_mask" result="blurred_light_mask" stdDeviation="${diagram_appearance["settings"]["inset_light"]["blur_radius"] / 2}"/>
                                <feComposite in="diagram_mask" in2="blurred_light_mask" operator="out" result="inset_light_mask"></feComposite>
                                <feFlood flood-color="${diagram_appearance["colors"][theme][i]["inset_light"]["color"]}" flood-opacity="${diagram_appearance["colors"][theme][i]["inset_light"]["opacity"]}" result="light_color"></feFlood>
                                <feComposite in="light_color" in2="inset_light_mask" operator="in" result="inset_light"></feComposite>
                                
                                <feMerge>
                                    <feMergeNode in="shadow"></feMergeNode>
                                    <feMergeNode in="SourceGraphic"></feMergeNode>
                                    <feMergeNode in="inset_light"></feMergeNode>
                                    <feMergeNode in="inset_shadow"></feMergeNode>
                                </feMerge>
                            </filter>`;
        }
    }

    svg_diagram += `</defs>`;
    svg_diagram += `</svg>`;

    // Рендерим слайд
    layout += `<main>
                   ${svg_diagram}
                   <div class="diagram_text">
                       <h2 class="total">${data["totalText"]}</h2>
                       <h3 class="difference">${data["differenceText"]}</h3>
                   </div>
                   <div class="categories">`;
    
    for(let i = 0; i < categories.length; i++){
        layout += `<div class="category">
                       <h3 class="category_title">${categories[i]["title"]}</h3>
                       <h3 class="category_value">${categories[i]["value"]}</h3>
                       <h3 class="category_difference">${categories[i]["difference"]}</h3>
                   </div>`;
    }

    layout += `    </div>
               </main>`;

    return layout;
}
function renderActivity(data){
    let layout = "";

    const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    let maxValue = 0;
    let ranges = [
        [0, 0, "min"],
        [1, 2, "mid"],
        [3, 4, "max"],
        [5, 6, "extra"]
    ];

    // Определяем максимальное значение и интервалы
    for(let hour = 0; hour < 24; hour++){
        for(let weekday = 0; weekday < 7; weekday++){
            maxValue = Math.max(
                data["data"][weekdays[weekday]][hour],
                maxValue
            );
        }
    }

    ranges[1][0] = 1;
    ranges[1][1] = ranges[1][0] + Math.floor(maxValue / 3) - 1;
    ranges[2][0] = ranges[1][1] + 1;
    ranges[2][1] = ranges[2][0] + Math.floor(maxValue / 3) - 1;
    ranges[3][0] = ranges[2][1] + 1;
    ranges[3][1] = maxValue;

    // Рендерим слайд
    layout += `<main>
                   <div class="grid">`;

    for(let hour = 0; hour < 24; hour++){
        for(let weekday = 0; weekday < 7; weekday++){
            let cellClassList = "cell";

            // Высота столбика при вертикальной ориентации
            let verticalCellHeight = "min";

            // Высота столбика при горизонтальной ориентации
            let horizontalCellHeight = "min";

            // Количество комитов за 1 час
            let commitsPerHour = data["data"][
                weekdays[weekday]
            ][hour];

            // Количество комитов за 2 часа
            let commitsPerHours = data["data"][
                weekdays[weekday]
            ][hour] + data["data"][
                weekdays[weekday]
            ][hour + (hour % 2 ? -1 : 1)];
            
            // Определяем интервал для столбика
            for(let i = 0; i < ranges.length; i++){
                if(commitsPerHour >= ranges[i][0] && 
                   commitsPerHour <= ranges[i][1]){
                    verticalCellHeight = ranges[i][2];
                }
                if(commitsPerHours >= ranges[i][0] && 
                   commitsPerHours <= ranges[i][1]){
                    horizontalCellHeight = ranges[i][2];
                }
            }

            cellClassList += ' v-' + verticalCellHeight;            
            cellClassList += ' h-' + horizontalCellHeight;            
            layout += `<div class="${cellClassList}" hour="${hour + 1}" weekday="${weekday + 1}" value="${commitsPerHour}"></div>`;
        }
    }

    layout += '</div>';

    // Добавляем легенду
    layout += `<ul class="legend">
                   <li>
                       <div class="legend__step"></div>
                       <h3 class="hide_on_horiz">1 час</h3>
                       <h3 class="hide_on_vertic">2 часа</h3>
                   </li>`;
    
    for(let i = 0; i < ranges.length; i++){
        layout += `<li>
                       <div class="legend__${ranges[i][2]}_cell"></div>`;
        
        if(ranges[i][0] === ranges[i][1]){
            layout += `<h3>${ranges[i][0]}</h2>`;
        }
        else{
            layout += `<h3>${ranges[i][0]} — ${ranges[i][1]}</h2>`;
        }

        layout += `</li>`;
    }
    
    layout += `</ul></main>`;

    return layout;
}

function renderTemplate(alias, data){
    alias = alias.toLowerCase();

    let layout = `<div class="story-${alias}">
                      <header>
                          <h1 class="title">${data["title"]}</h1>
                          <h3 class="subtitle">${data["subtitle"]}</h3>
                      </header>`; 

    if(alias === "leaders"){
        layout += renderLeaders(data);
    }
    else if(alias === "vote"){
        let offset = 0;

        if(data.hasOwnProperty("offset")){
            offset = data["offset"];
        }

        layout += renderVote(data, offset);
    }
    else if(alias === "chart"){
        layout += renderChart(data);
    }
    else if(alias === "diagram"){
        layout += renderDiagram(data);
    }
    else if(alias === "activity"){
        layout += renderActivity(data);
    }
    else{
        console.error("Unknown alias '" + alias + "'");
        return "";
    }

    layout += '</div>';

    return layout;
}

window.renderTemplate = renderTemplate;