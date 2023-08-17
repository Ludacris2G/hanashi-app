const ws = require('ws');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');
const Message = require('../models/Message');

const handleWebSocketConnection = (server) => {
  const wss = new ws.WebSocketServer({ server });

  function sendOnlinePeople() {
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
  }

  wss.on('connection', (connection, req) => {
    connection.isAlive = true;

    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        clearInterval(connection.timer);
        connection.isAlive = false;
        connection.terminate();
        sendOnlinePeople();
      }, 1000);
    }, 5000);

    connection.on('pong', () => {
      clearTimeout(connection.deathTimer);
    });

    // connection.on('close', () => {
    //   sendOnlinePeople();
    //   clearInterval(connection.timer);
    //   clearTimeout(connection.deathTimer);
    // });

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
    sendOnlinePeople();

    connection.on('message', async (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipient, text } = messageData;
      if (recipient && text) {
        const messageDoc = await Message.create({
          sender: connection.userId,
          recipient,
          text: text,
        });

        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            client.send(
              JSON.stringify({
                text,
                sender: connection.userId,
                _id: messageDoc._id,
                timestamp: messageDoc.createdAt,
                recipient,
              })
            );
          });
      }
    });
  });
};

module.exports = handleWebSocketConnection;
