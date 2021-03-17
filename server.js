const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.ttf': 'application/x-font-ttf',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
}

let storiesData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

http.createServer(function(req, res){  
    let urlData = new URL(req.url, 'http://localhost:8080/');
    
    if(urlData.pathname == "/"){
        let theme = urlData.searchParams.get("theme");
        theme = (theme === null ? 'dark' : theme);
        theme = ['dark', 'light'].indexOf(theme.toLowerCase());
        theme = Math.max(0, theme);

        let slide = urlData.searchParams.get("slide");
        slide = Number(slide);
        slide = (isNaN(slide) ? 0 : Math.max(0, Math.min(10, slide - 1)));

        let slideAlias = storiesData[slide]["alias"];
        let slideData = JSON.stringify(storiesData[slide]["data"]);

        res.setHeader("Content-Type", "text/html; charset=utf-8;");

        res.write(`
            <html>
                <head>
                    <meta charset="utf8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1">
                    <title>Яндекс ШРИ</title>
                    <link type="image/png" sizes="16x16" rel="icon" href="./images/favicon-16-${theme ? 'light' : 'dark'}.png">
                    <link type="image/png" sizes="32x32" rel="icon" href="./images/favicon-32-${theme ? 'light' : 'dark'}.png">
                    <link type="image/png" sizes="48x48" rel="icon" href="./images/favicon-48-${theme ? 'light' : 'dark'}.png">
                    <link rel="stylesheet" href="./stories.css">
                </head>
                <body class="${theme ? 'theme_light' : 'theme_dark'}">
                    <script src="./stories.js"></script>
                    <script>
                        window.onload = function() {
                            let body = document.getElementsByTagName("body")[0];
                            body.innerHTML = renderTemplate("${slideAlias}", ${slideData});
                        }
                    </script>
                </body>
            </html>
        `);

        res.end();
    }
    else{
        try{
            const filepath = path.join(__dirname, '/build/', urlData.pathname);
        
            const stream = fs.createReadStream(filepath);

            stream.on('open', () => {
                res.setHeader(
                    'Content-Type',
                    mimeTypes[path.extname(urlData.pathname)]
                );
            });

            stream.on('error', (err) => {
                let status;
                let message;
                
                if (err.code === 'ENOENT') {
                    status = 404;
                    message = 'File not found';
                }
                
                res.writeHead(
                    status || 500,
                    {'Content-Type': 'text/plain', Connection: 'close'}
                );
                res.end(message || 'Internal error');

                // console.warn(err);
            });

            stream.pipe(res);

            res.on('close', () => {
                stream.destroy();
            });
        }
        catch(err) {
            res.writeHead(err.code || 500, { Connection: 'close' });
            res.end(err.message || 'Internal error');
            // console.log(err);
        }
    }
}).listen(8080);