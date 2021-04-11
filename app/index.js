let http = require('http');

const ip = '127.0.0.1'; //localhost
const port = 3005;

http.createServer((request, response) => {
    console.log('request ', request.url);
}).listen(port, ip);

console.log('Running at http://' + ip + ':' + port + '/');