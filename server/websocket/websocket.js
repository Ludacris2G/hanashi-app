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

    connection.on('close', () => {
      sendOnlinePeople();
      clearInterval(connection.timer);
      clearTimeout(connection.deathTimer);
    });

    // read username and id from the cookie
    const { cookie } = req.headers;
    if (cookie) {
      const tokenCookieString = cookie
        ?.split(';')
        .find((str) => str.startsWith('token='));
      const token = tokenCookieString?.split('=')[1];

      if (token) {
        try {
          jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
            if (err) throw new UnauthenticatedError('Unauthorized');
            const { userId, name } = userData;
            connection.userId = userId;
            connection.username = name;
          });
        } catch (error) {
          if (error instanceof UnauthenticatedError) {
            connection.send(
              JSON.stringify({
                logout: true,
              })
            );
          }
        }
      }
    }

    // send online people to all users
    sendOnlinePeople();

    connection.on('message', async (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, file } = messageData;
      let fileData = null;

      if (file) {
        const [, mimeType, base64WithoutPrefix] = file.data.match(
          /^data:(.*);base64,(.*)$/
        );

        const bufferData = Buffer.from(base64WithoutPrefix, 'base64');
        fileData = {
          data: bufferData,
          name: file.name,
          mimeType: file.type,
        };
      }

      if (recipient && text) {
        const messageDocData = {
          sender: connection.userId,
          recipient,
          text: text,
        };

        if (fileData) {
          messageDocData.file = fileData;
        }

        const messageDoc = await Message.create(messageDocData);

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
