import { WebSocketServer } from 'ws';

let wss = undefined;    // server
let wcl = undefined;     // client

export async function init(addr) {
    try {
        // setup server
        wss = new WebSocketServer({ port: 1509 });

        wss.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
                console.log('received: %s', data);
            });
        });

        await init_client(addr);

    } catch (e) {
        return false;
    }
}

async function init_client(addr) {
    // connect to database
    wcl = new WebSocket(addr);

    ws.on('open', function open() {
        ws.send('something');
    });

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    })
}
