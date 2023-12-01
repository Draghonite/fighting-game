const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8082 });
let clients = [];

const getClientById = (id) => {
  return clients.filter(c = c.ID == id)[0];
};

const getClientIds = () => {
  return clients.map(c => c.ID);
};

const removeClientById = (id) => {
  clients = clients.filter(c => c.ID == id);
};

const getPlayers = () => {
  return clients.filter(c => c.role === 'Player');
}

const getScreens = () => {
  return clients.filter(c => c.role === 'Screen');
}

const sendAll = (message) => {
  clients.forEach(client => {
    client.send(JSON.stringify(message));
  });
}

const sendScreens = (message) => {
  getScreens().forEach(client => {
    client.send(JSON.stringify(message));
  });
}

wss.on('connection', (client) => {
  if (clients.length >= 3) {
    client.close(1000, 'Sorry, no available connections at this time.');
    return;
  }

  // let CLIENT_ID = Date.now();
  client.ID = Date.now();
  clients.push(client);
  // clientIds[CLIENT_ID] = client;

  // clients.push(client);

  console.log('[server]: New client connected!', client.ID);
  client.send(JSON.stringify({ action: 'REG' }));

  client.on('message', (data) => {
    console.log('[server]: clients', client.ID, clients.length);
    // parse the message
    const message = JSON.parse(data.toString());
    message.ID = client.ID;
    message.role = client.role ?? message.role;

    // handle registrations
    if (message.action === 'REG') {
      client.role = message.role;
      console.log(`[server]: New ${message.role} Registered! ${client.ID}`);
      sendScreens({ action: 'REG_ACK', role: client.role, ID: client.ID });
      return;
    }

    // if closure, remove the client id entry
    if (message.action === 'close') {
      // delete clientIds[message.clientId];
      removeClientById(client.ID);
      // TODO: handle the outcome -- automatic win by remaining client
      console.log('[server]: WINNER', getClientIds());
    }

    // send data to all clients, but ideally only to the screen client, not player clients
    console.log('[server]: FROM-CLIENT', message);
    clients.forEach(c => {
      c.send(JSON.stringify(message));
    });
    console.log('[server]:', getClientIds());
  });

  client.on('close', (code, reason) => {
    // TODO: update clients list -- remove closed connections to allow more
    // clients = clients.filter(c => !c.CLOSED);
    console.log('[server]: Client disconnected!', clients.length);
  });
});
