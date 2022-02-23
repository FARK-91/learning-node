let http = require('http')
let mysql = require('mysql')
let fs = require('fs')
let path = require('path')
let { API, database } = require('./api.js');
database.create();


const ip = '127.0.0.1'; // localhost
const port = 3000

// Create server using http module, and wait for response:
http.createServer(function(request, response){
    // Print request object just for fun
    console.log('request ', request.url)
    // Add . to URL to convert it to local file path
    let file = '.' + request.url
    // Redirect / to serve index.html
    if(file === './') file = './index.html'
    // Extract requested file extension
    let extension = String(path.extname(file)).toLowerCase()
    // Define acceptable file extensions
    let mime = { 
                '.html' : 'text/html',
                '.js' : 'text/javascript',
                '.css' : 'text/css',
                '.json' : 'application/json',
                '.png' : 'image/png',
                '.jpg' : 'image/jpg',
                '.gif' : 'image/gif',
                }
    // If requested file is not in mime, default
    // to octet-stream which means "arbitrary binary data."
    let type = mime[extension] || 'application/octet-stream'

    // Read the file from the hard drive
    fs.readFile(file, function(error, content){
        if(error){
            if(error.code === 'ENOENT'){
                // If this is an API call, or should we serve a file?
                if (API.catchAPIrequest(request.url))
                    response.end(API.exec(request.url), 'utf-8')
                else
                    // Not an API call - file just doesnt exist
                    fs.readFile('./404.html', (error, content) => {
                        response.writeHead(200, {'Content-Type' : type})
                        response.end(content, 'utf-8')
                    })
            }
            else {
                response.writeHead(500)
                response.end('Error: ' + error.code + '\n')
                response.end()
            }
        }
        else {
            response.writeHead(200, {'Content-Type' : type})
            response.end(content, 'utf-8')
        }
    })
}).listen(port, ip)

console.log('Running at http://' + ip + ':' + port + '/')