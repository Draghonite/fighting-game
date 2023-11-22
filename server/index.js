const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8082 });
let clients = [];

wss.on('connection', (client, request) => {
  if (clients.length === 3) { 
    client.close(1000, 'Sorry, no available connections at this time.');
    return; 
  }

  clients.push(client);

  console.log('[server]: New client connected!');

  client.on('message', (data) => {
    // send data to all clients, but ideally only to the screen client, not player clients
    console.log('[server]: FROM-CLIENT', data.toString());
    clients.forEach(c => {
      c.send(data.toString());
    });
  });

  client.on('close', (code, reason) => {
    // TODO: update clients list -- remove closed connections to allow more
    // clients = clients.filter(c => !c.CLOSED);
    console.log('[server]: Client disconnected!', clients.length);
  });
});
