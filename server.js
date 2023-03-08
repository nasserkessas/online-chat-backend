import { readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module';
import { WebSocketServer } from 'ws';
import * as dotenv from 'dotenv'

const require = createRequire(import.meta.url);

dotenv.config();

const wss = new WebSocketServer({ port: process.env.WS_PORT || 8080 });

let clients = [];

wss.on("connection", (socket, req) => {
  
  log(`new connection`);

  clients.push({socket, code: req.url.slice(1)});

  socket.on('message', (message) => {
    log(`message received: ${message}`);

    message = message.slice(0, 50); // max message length will be 50

    const thisCode = clients.find(c => c.socket === socket).code;

    let messageData = JSON.parse(readFileSync(require.resolve("./codes.json")));
    
    messageData[thisCode].push(message.toString())

    writeFileSync(require.resolve("./codes.json"), JSON.stringify(messageData));

    for (let client of clients.filter(c => c.code === thisCode)) {
      client.socket.send(message);
    }
  });

  socket.on('close', () => {
    log(`connection closed`);
    clients = clients.filter(c => c.socket != socket);
    log(clients.length);
  });
})

let log = console.log;
