const ws = require('ws');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const handleWebSocketConnection = (server) => {
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (connection, req) => {
    // read username and id from the cookie
    const { cookie } = req.headers;
    if (cookie) {
      const tokenCookieString = cookie
        ?.split(';')
        .find((str) => str.startsWith('token='));
      const token = tokenCookieString?.split('=')[1];

      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) throw new UnauthenticatedError('Unauthorized');
          const { userId, name } = userData;
          connection.userId = userId;
          connection.username = name;
        });
      }
    }
    // send online people to all users
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });

    connection.on('message', (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipient, text } = messageData;
      if (recipient && text) {
        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            client.send(JSON.stringify({ text, sender: connection.userId }));
          });
      }
    });
  });
};

module.exports = handleWebSocketConnection;
