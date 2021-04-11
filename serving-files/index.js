let http = require('http');  // give us http
let fs = require('fs');     //  give us fs
let path = require('path'); //  give us "string" .pathext()

const ip = '127.0.0.1';
const port = '3005';

// Create server using http module, and wait for response:
http.createServer((request, response) => {
    // print request object just for fun
    // console.log(request);
    // Add . to URL to convert it to local file path
    let file = '.' + request.url;
    // Redirect / to serve index.html
    if(file == './') file = './index.html';
    // rferrer: To Download file, Un-Comment line below
    // file = './index.txt';
    // Extract requested file's extension
    let extension = String(path.extname(file)).toLowerCase();
    // Define acceptable file extensions
    let mime = { '.html': 'text/html' }
    // If requested file type is not in mime, default
    // to octet-stream wich means "arbitrary binary data"
    let type = mime[extension] || 'application/octet-stream';

    //read file from the hard drive
    fs.readFile(file, (error, content) => {
        if(error){
            console.log(error)
            if(error.code == 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    response.writeHead(200, {'Content-Type': type});
                    response.end(content, 'utf-8');
                });
            } else{
                response.writeHead(500);
                response.end('Error: ' + error.code + '\n');
                response.end();
            }
        } else{
            response.writeHead(200, {'Content-Type': type});
            response.end(content, 'utf-8');
        }
    })
}).listen(port, ip);

// Display server is running message
console.log('Running at ' + ip + ':' + port + '/');