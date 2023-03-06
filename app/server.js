import { WebSocketServer } from 'ws';
import * as dotenv from 'dotenv'

dotenv.config();

const wss = new WebSocketServer({ port: process.env.WS_PORT || 8080 });

let clients = [];

wss.on("connection", (socket, req) => {
  
  log(`new connection`);

  clients.push({socket, code: req.url.slice(1)});
  log(clients.length);


  socket.on('message', (message) => {
    log(`message received: ${message}`);

    message = message.slice(0, 50); // max message length will be 50

    const thisCode = clients.find(c => c.socket === socket).code;

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
