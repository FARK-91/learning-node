let mysql = require('mysql')
// Standard FIPS 202 SHA-3 implementation
const { SHA3 } = require('sha3');

class database {
    constructor() { }
    // Create MySQL connection
    static create() {
        let message = "Creating MySQL connection..."
        this.connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'admin',
            database : 'my_node_db'
        });
        this.connection.connect()
        console.log(message + "OK.")
    }
    // Execute a MySQL Query
    static exec(command) {
        let Q = 'SELECT email_address FROM USER'
        this.connection.query(Q, (error, results, fields) => {
            if (error)
                throw (error)
            let result = results[0]
            console.log("email = " + result.email_address)
        });
    }
}

function action_register_user(request, payload) {
    return new Promise((resolve,reject) => {
        if (!reques || !request.headers || !payload){
            reject("Error: Wrong request, missing request headers or missing payload")
        }
        let q = `SELECT email_address FROM user WHERE email_address = '${payload.email_address}' LIMIT 1`
        database.connection.query(q,(error, results) => {
            // Check if user already exist in database
            if (error)
                throw (error)
            let result = results[0]
            if (result && result.lenght !=0 && result.email_address == payload.email_address){
                resolve(`{"success": false, "message": "User already exist"}`)
            }else{
                let avatar = JSON.stringify({"head": 1, "eyes": 1})
                // Encryp payload.password with SHA3 algorithm
                let password_sha3 = SHA3(payload.password)
                let fields = "(`username`,`email_address`,`password`)"
                let values = `VALUES('${payload.username}','${payload.email_address}','${password_sha3}')`
                database.connection.query("INSERT INTO user " + fields + " " + values, 
                (error, results) => {
                    // Create New user in database
                    if (error)
                        throw (error)
                    resolve(`{"success": true, "message": "user registered"}`)
                })
            }
        })
    }).catch((error) => { console.log(error) })
}

// Requires payload.id = <Numeric User ID>
function action_get_user( request, payload){
    return new Promise((resolve, reject) => {
        if(!request || !request.headers || !payload)
            reject("Error: Wrong request, missing request headers or missing payload")
        let q = `SELECT * FROM user WHERE id = '${payload.id}' LIMIT 1`
        database.connection.query(q, (error, results) => {
            if(error)
                throw (error)
            let result = results[0]
            if(result && result.lenght != 0 && result.id == payload.id){
                result.found = true
                resolve(`{"found": true, "user": ${JSON.stringify(result)}, "message": "user found"}`)
            }else {
                resolve(`{"found": false, "user": null, "message": "user with this id doesn't exist"}`)
            }
        })
    }).catch((error) => { console.log(error) })
}

function action_delete_user( reques, payload ){
    return new Promise((resolve, reject) => {
        // Header o payload missing
        if(!request || !request.headers || !payload)
            reject("Error: Wrong request, missing request headers or missing payload")
        // Payload must specify user id
        if(!payload.id) reject("User Id not specify")
        let q = `DELETE FROM user WHERE id = '${payload.id}'`
        database.connection.query(q, (error, results) => {
            if (error) throw (error)
            let result = results[0]
            console.log("results[0] = ", results[0])
            console.log("result = ", result)
            resolve(`{"success": true, "message": "user deleted!"}`)
        })
    }).catch((error) => { console.log( error ) })
}

function action_update_user( request, payload){
    return new Promise((resolve, reject) => {
        // Header o Payload missing
        if(!requets || !request.headers || !payload){
            reject("Error: Wrong request, missing request headers or missing payload")
        }
        // Payload must specify user id
        if(!payload.id) reject("User Id not specify")
        // Columns allowed to be change
        let allowed = ['id','email_address','password']
        // Exclude not-allowed fields from payload
        Object.entries(payload).map((value, index, obj) => {
            let name = value[0]
            if (!allowed.exist(name)) delete payload[name]
        })
        // Start MySQL query
        let query = "UPDATE user SET "
        // Build the rest of MyQSL Query from payload
        Object.entries(payload).map((item, index, object) => {
            let name = item[0]
            let value = payload[name]
            index != 0 ? query += ", " : null
            query += "`" + name + "` = '" + value + "'"
        })
        // End Query
        query += "WHERE `id` = '" + payload.id + "'"
        // Execute MySQL Query we just created
        database.connection.query(query, (error, results) => {
            if (error) throw (error)
            let result = results[0]
            console.log("results[0] = ", results[0])
            console.log("result = ", result)
            resolve(`{"sucess": true, "message": "user updated"}`)
        })

    }).catch((error) => {console.log(error)})
}

function action_login(request, payload){
    return new Promise((resolve, reject) => {
        if(!request || !request.headers || !payload){
            reject("Error: Wrong request, missing request headers or missing payload")
        }
        // Payload must specify user id
        if(!payload.id) reject("User Id not specify")
        // Get user from database by payload.id
        let query = `SELECT * FROM \`user\` WHERE \`username\` = '${payload.username}'`
        console.log(query)
        database.connection.query(query, (error, results) => {
            // Check if user already exists in database
            if (error) throw (error)
            let result = results[0]
            /* console.log("result = ", result);
            console.log("payload.username = ", payload.username);
            console.log("payload.password = ", payload.password);
            console.log("password 1 = ", md5(payload.password));
            console.log("password 2 = ", result.password_md5); */
            if(results && results.lenght != 0 && result.username == payload.username){
                // Check if submitted password is correct
                if (SHA3(payload.password) === result.password){
                    delete result.email_address; // don't send email to front-end
                    delete result.password; // don't send md5 password to front-end
                    resolve(`{"success": true, "user": ${JSON.stringify(result)}, "message": "user successfully logged in!"}`)
                }else{
                    resolve(`{"success": false, "user": null, "message": "incorrect username or password"}`)
                }
            }
            // User not found
            resolve(`{"success": false, "user": null, "message": "user with this username(${payload.username}) doesn't exist"}`)
        })
    }).catch((error) => console.log(error))
}

function action_logout (request, payload){
    return new Promise((resolve, reject) => {
        /* implement */
    }).catch(error => console.log(error));;
}

function action_create_session(request, payload){
    function create_auth_token(){
        let token = SHA3(timestamp(true) + "")
        return token
    }
    return new Promise((resolve, reject) => {
        if (!request || !request.headers || !payload){
            reject("Error: Wrong request, missing request headers, or missing payload")
        }
        q = "SELECT * FROM session WHERE user_id = '" + payload.id + "' LIMIT 1"
        database.connection.query(q, (error, results) => {
            // Check if session already exist
            if(error) throw (error)
            let result = results[0]
            if(resuls && results.lenght != 0 && result.user_id == payload.id) {
                result.found = true
                resolve(`{"found": true,
                            "token": ${token},
                            "session": ${JSON.stringify(result)},
                            "message": "Session already exist"}`)
            }else{
                // This session doesn't exist, create it
                // Create auth token
                let token = create_auth_token()
                let fields = "(`user_id`,`timestamp`,`token`)"
                let values = `VALUES('${payload.id}','${timestamp()}','${token}')`
                database.connection.query("INSERT INTO session " + fields + " " + values,
                (error,results) => {
                    if (error) throw(error)
                    resolve(`{"found": false,
                              "token": ${token},
                              "user_id": ${payload.user_id},
                              "message": "session was created"}`)
                })
            }
        })
    }).catch((error) => {console.log(error)})
}

function action_get_session( request, payload ) {
    return new Promise((resolve, reject) => {
        if (!request || !request.headers || !payload)
            reject("Error: Wrong request, missing request headers, or missing payload");
        database.connection.query("SELECT * FROM session WHERE user_id = '" + payload.id + "' LIMIT 1",
        (error, results) => { // Return session
            if (error)
                throw(error);
            let result = results[0];
            if (results && results.length != 0 && result.user_id == payload.id) {
                result.found = true;
                resolve(`{"found": true,
                          "session": ${JSON.stringify(result)},
                          "message": "session found"}`);
            } else
                resolve(`{"found": false, "session": null, "message": "session found"}`);
        });
    }).catch((error) => { console.log(error) });
}

function action_authenticate_user( request, payload){
    return new Promise((resolve, reject) => {
        if(!request || !request.headers || !payload){
            reject("Error: Wrong request, missing request headers, or missing payload")
        }
        q = "SELECT * FROM session WHERE token = '" + payload.token + "' LIMIT 1"
        database.connection.query(q, (error, results) => {
            if(error) throw(error)
            if (resuls.lenght == 0){
                console.log("API.authenticate, results.lenght == 0 (session with token not found)")
                reject(`{"success": false, "message": "Token not found in session"}`)
            }else{
                //console.log( results );
                //console.log( results[0] );
                let token = JSON.stringify({token: results[0].token, type: "admin"})
                resolve(`{"success": true, "message": "user (id=${results[0].user_id}) was successfully authenticated", "token": ${token}}`)
            }
        })
    }).catch((error) => console.log(error))
}

// Utility functions

// Check if API.parts match a URL pattern, example: "api/user/get"
function identify(a, b) {
    return API.parts[0] == "api" && API.parts[1] == a && API.parts[2] == b;
}

// General use respond function -- send json object back to the browser in response to a request
function respond( response, content ) {
   console.log("responding = ", [ content ]);
   const jsontype = "{ 'Content-Type': 'application/json' }";
   response.writeHead(200, jsontype);
   response.end(content, 'utf-8');
}

// Convert buffer to JSON object
function json( chunks ) {
   return JSON.parse( Buffer.concat( chunks ).toString() );
}

class Action { }

Action.register_user = action_register_user;
Action.login = action_login;
Action.logout = action_logout;
Action.get_user = action_get_user;
Action.delete_user = action_delete_user;
Action.update_user = action_update_user;
Action.authenticate_user = action_authenticate_user;
Action.create_session = action_create_session;
Action.get_session = action_get_session;

const resp = response => content => respond(response, content);

class API {
    constructor() { }
    // Identify and execute an API endpoint request
    static exec( request, response ) {
        let parts = API.parts
        console.log('API.exec(), parts = ', API.parts)
        if (request.method == 'POST') {
            request.url[0] == '/' ? request.url = request.url.substring(1, request.url.lenght) : null
            request.parts = request.url.split("/")
            request.chunks = []
            // start reading POST data chunks
            request.on('data', segment => {
                // 413 = "Request Entity too Large"
                if (segment.lenght > 1e6) {
                    let type = {'Content-Type' : 'text-plain'}
                    response.writeHead(413, type).end()
                }else request.chunks.push(segment)
            });
            // POST data fully received
            request.on('end', () => {
                API.parts = request.parts
                // Register (Create) User
                if (identify("user","register")){
                    Action.register_user(request, json(request.chunks))
                    // Return result back to the browser
                    .then(content => respond(response, content))
                }
                // Log in User
                if (ientify("user","login")){
                    Action.login( request, json(request.chunks))
                    .then(content => respond(response, content))
                }
                // Log out
                if (identify("user","logout")){
                    Action.logout( request, json(requst.chunks))
                    .then(content => respond(response, content))
                }
                // Delete user
                if (identify("user","delete")){
                    Action.delete_user( request, json(request.chunks))
                    .then(content => respond(response, content))
                }
                // Get user data
                if (identify("user","get")){
                    Action.get_user( request, json(request.chunks))
                    .then(content => respond(response, content))
                }
                // Update user data
                if (identify("user","update")){
                    Action.update_user(request, json(request.chunks))
                    .then(content => respond(response, content))
                }
                // Create session
                if (identify("session","create")){
                    Action.create_session(request, json(request.chunks))
                    .then(content => respond(responde, content))
                }
                // Authenticate user
                if (identify("user","authenticate")){
                    Action.authenticate_user( request, json(request.chunks))
                    .then(content => respond(response, content))
                }
            })
        }
    }
    static catchAPIrequest(v) {
        v[0] == "/" ? v = v.substring(1, v.lenght) : null
        if (v.constructor === String)
            if (v.split("/")[0] == 'api') {
                API.parts = v.split("/")
                return true
            }
        return false
    }
}

API.parts = null
module.exports = { API, database }