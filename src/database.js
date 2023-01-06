import { WebSocketServer } from 'ws';

let ws = undefined;     // client

export async function init(addr) {
    try {
        // connect to database
        ws = new WebSocket(addr);
        ws.on('open', function open() {
            ws.send('Jesus loves you');
        });
    } catch (e) {
        return false;
    }
}