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
            cache["msg"] = data.toString();
        });
    });

    // delay a bit
}

// request new API KEY
// code for `new_api_key` is 2
export async function new_api_key(parcel) {
    ws.on('open', function open() {
        ws.send(`~2#`);

        ws.on('message', function message(data) {
            console.log(`received: ${data}`);
        });
    });
}