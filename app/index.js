//console.log(process); // Output native Node process object

let path = require('path')
let ext = path.extname('index.js')

console.log(ext); // Output '.js'