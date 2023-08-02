const ws = require('ws');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const handleWebSocketConnection = (server) => {
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (connection, req) => {
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
  });
};

module.exports = handleWebSocketConnection;
