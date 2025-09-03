import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';

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

const stamp = () => new Date().toISOString();

const sendJson = (ws, payload) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
};

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
      console.log(`[${stamp()}] <= (invalid json)`, message.toString());
      console.log(`[${stamp()}] ->`, errRes);
      return sendJson(ws, errRes);
    }

    console.log(`[${stamp()}] <=`, msg);

    const res = {
      type: msg.type,
      data:  msg.data ,
      id: 0,
    };
      
    console.log(`[${stamp()}] ->`, res);
    sendJson(ws, res);
  });

  ws.on('close', () => {
    console.log(`[${stamp()}] WS closed`);
  });
});


function shutdown() {
  console.log('Shutting down…');
  for (const client of wss.clients) {
    try { client.close(1001, 'Server shutting down'); } catch {}
  }
  httpServer.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
