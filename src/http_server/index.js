import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import { handleReg, handleCreateRoom, handleSinglePlay } from './handlers.js';
import { sendJson, stamp } from './utils.js';

export const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});


wss.on('connection', (ws) => {
    console.log(`[${stamp()}] WS connected`);

    ws.on('message', (message) => {

        let msg;

        try {
            msg = JSON.parse(message.toString());
        } catch {
            const errRes = {
                type: 'error',
                data: { error: true, errorText: 'Invalid JSON' },
                id: 0,
            };
            console.log(`[${stamp()}] <= (invalid json)`, msg);
            console.log(`[${stamp()}] ->`, errRes);
            return sendJson(ws, errRes);
        }

        console.log(`[${stamp()}] <=`, msg);


        switch (msg.type) {
            case "reg":
                return handleReg(ws, msg);
            case "create_room":
                return handleCreateRoom(ws, wss);
            case "single_play":
                return  handleSinglePlay(ws);
            default:
                return sendJson(ws, { type, msg, id: 0 });
        }


    });



    ws.on('close', () => {
        console.log(`[${stamp()}] WS closed`);
    });
});


function shutdown() {
    console.log('Shutting down…');
    for (const client of wss.clients) {
        try { client.close(1001, 'Server shutting down'); } catch { }
    }
    httpServer.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
