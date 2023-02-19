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

// revoke the access of an app
// code for `delRecord` is 0

export async function describeDid(did) {
    const result = await new Promise((resolve) => {
        ws.send(`~0#${did}`);
        ws.on('message', function message(data) {
            // console.log(`received: ${data}`);
            resolve(data);
        });
    });

    return JSON.parse(result);
}

// send the did document to the database network
// code for `newSamaritan` is 1
export async function newSamaritan(did_str) {
    const result = await new Promise((resolve) => {
        // ws.on('open', function open() {
            ws.send(`~1#${did_str}`);
            ws.on('message', function message(data) {
                console.log(`recieved: ${data}`);
                resolve(data);
            });
        // });
    });

    return JSON.parse(result);
}

// request new API KEY
// code for `newApiKey` is 2
export async function newApiKey() {
    const result = await new Promise((resolve) => {
        // ws.on('open', function open() {
            ws.send(`~2#`);
            ws.on('message', function message(data) {
                console.log(`received: ${data}`);
                resolve(data);
            });
        // });
    })

    return JSON.parse(result);
}

// authenticate app || samaritan
// code for `authDid` is 3
export async function authDid(keys) {
    const result = await new Promise((resolve) => {
        // ws.on('open', function open() {
            ws.send(`~3#${keys}`);
            ws.on('message', function message(data) {
                console.log(`received: ${data}`);
                resolve(data);
            });
        // });
    });

    return JSON.parse(result);
}

// perform insertion into database
// code for `insertRecord` is 4
export async function insertRecord(did, key, value, session_did) {
    const result = await new Promise((resolve) => {
        ws.send(`~4#${did ? did : ""}#${key}#${JSON.stringify(value)}#${session_did}`);
        ws.on('message', function message(data) {
            console.log(`received: ${data}`);
            resolve(data);
        });
    });

    return JSON.parse(result);
}


// retreive value from database
// code for `insertRecord` is 5
export async function getRecord(did, key, session_did) {
    const result = await new Promise((resolve) => {
        ws.send(`~5#${did ? did : ""}#${key}#${session_did}`);
        ws.on('message', function message(data) {
            // console.log(`received: ${data}`);
            resolve(data);
        });
    });

    return JSON.parse(result);
}

// retreive value from database
// code for `delRecord` is 6
export async function delRecord(did, key, session_did) {
    const result = await new Promise((resolve) => {
        ws.send(`~6#${did ? did : ""}#${key}#${session_did}`);
        ws.on('message', function message(data) {
            // console.log(`received: ${data}`);
            resolve(data);
        });
    });

    return JSON.parse(result);
}

// revoke the access of an app
// code for `delRecord` is 6

export async function revoke(did, session_did) {
    const result = await new Promise((resolve) => {
        ws.send(`~7#${did}#${session_did}`);
        ws.on('message', function message(data) {
            // console.log(`received: ${data}`);
            resolve(data);
        });
    });

    return JSON.parse(result);
}


