for(let i = 0; i < 5; i++){
    let iconSizes = [16, 32, 48, 96, 128]
    require(`./images/favicon-${iconSizes[i]}-dark.png`);
    require(`./images/favicon-${iconSizes[i]}-light.png`);
}

for(let i = 1; i <= 12; i++){
    require(`./images/${i}.jpg`)
}

require('./styles/fonts.css')
require('./styles/themes.css')
require('./styles/main.css')
require('./styles/leaders.css')
require('./styles/vote.css')
require('./styles/chart.css')
require('./styles/diagram.css')
require('./styles/activity.css')

require('./scripts/render.js')