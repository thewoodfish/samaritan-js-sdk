import WebSocket from 'ws';

let ws = undefined;     // client

export async function init(addr) {
    try {
        // connect to database
        ws = new WebSocket(addr);
        ws.on('open', function open() {
            console.log(`connected to database server at ${addr}`);
            // ws.send('Jesus loves you');
        });
    } catch (e) {
        console.log(`could not connect to database server at ${addr}`);
        return false;
    }

    return true;
}

// send the did document to the database network
// code for `new_samaritan` is 1
export async function new_samaritan(did_str, cache) {
    ws.on('open', function open() {
        ws.send(`~1#${did_str}`);

        ws.on('message', function message(data) {
            console.log(`recieved: ${data}`);
            cache["msg"] = JSON.parse(data.toString());
        });
    });

    // delay a bit  
}

// request new API KEY
// code for `new_api_key` is 2
export async function new_api_key(cache) {
    ws.on('open', function open() {
        ws.send(`~2#`);

        ws.on('message', function message(data) {
            console.log(`received: ${data}`);
            cache["msg"] = JSON.parse(data.toString());
        });
    });
}

// authenticate app || samaritan
// code for `auth_did` is 3
export async function auth_did(keys, cache) {
    ws.on('open', function open() {
        ws.send(`~3#${keys}`);

        ws.on('message', function message(data) {
            console.log(`received: ${data}`);
            cache["msg"] = JSON.parse(data.toString());
        });
    });
}

// perform insertion into database
// code for `insert_record` is 4
export async function insert_record(did, key, value, cache, session_did) {
    ws.send(`~4#${did ? did : ""}#${key}#${JSON.stringify(value)}#${session_did}`);

    ws.on('message', function message(data) {
        console.log(`received: ${data}`);
        cache["msg"] = JSON.parse(data.toString());
    });
}


// retreive value from database
// code for `insert_record` is 5
export async function get_record(did, key, cache, session_did) {
    ws.send(`~5#${did ? did : ""}#${key}#${session_did}`);

    ws.on('message', function message(data) {
        // console.log(`received: ${data}`);
        cache["msg"] = JSON.parse(data.toString());
    });
}

// retreive value from database
// code for `del_record` is 6
export async function del_record(did, key, cache, session_did) {
    ws.send(`~6#${did ? did : ""}#${key}#${session_did}`);

    ws.on('message', function message(data) {
        // console.log(`received: ${data}`);
        cache["msg"] = JSON.parse(data.toString());
    });
}

// revoke the access of an app
// code for `del_record` is 6
export async function revoke(did, cache, session_did) {
    ws.send(`~7#${did}#${session_did}`);

    ws.on('message', function message(data) {
        // console.log(`received: ${data}`);
        cache["msg"] = JSON.parse(data.toString());
    });
}
