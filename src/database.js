import WebSocket from 'ws';

let ws = undefined;     // client

export async function init(addr) {
    try {
        // connect to database
        ws = new WebSocket(addr);
        ws.on('open', function open() {
            console.log(`connected to database server at ${addr}`);
            ws.send('Jesus loves you');
        });
    } catch (e) {
        console.log(`could not connect to database server at ${addr}`);
        return false;
    }

    return true;
}

// send the name/did document to the database network
export async function new_samaritan(did_str) {
    ws.on('open', function open() {
        ws.send(did_str);

        ws.on('message', function message(data) {
            console.log('received: %s', data);
        });
    });
}

