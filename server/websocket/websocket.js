const ws = require('ws');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');
const Message = require('../models/Message');

const handleWebSocketConnection = (server) => {
  const wss = new ws.WebSocketServer({
    server,
    clientTracking: true,
    cors: {
      origin: process.env.FRONTEND_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });
  function sendOnlinePeople() {
    console.log(wss.clients);
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
    try {
      connection.isAlive = true;
      console.log('connected at', new Date());
      connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
          clearInterval(connection.timer);
          connection.isAlive = false;
          connection.terminate();
          console.log('connecion killed');
          sendOnlinePeople();
        }, 1000);
      }, 5000);

      connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
      });

      connection.on('close', () => {
        clearInterval(connection.timer);
        clearTimeout(connection.deathTimer);
        connection.isAlive = false;
        connection.terminate();
        sendOnlinePeople();
        console.log('connection closed at: ', new Date());
      });

      // read username and id from the cookie
      // const { cookie } = req.headers;
      // console.log('req url: ', req.url);
      // if (cookie) {
      //   const tokenCookieString = cookie
      //     .split(';')
      //     .find((str) => str.startsWith('token='));
      //   const token = tokenCookieString.split('=')[1];
      //   console.log('COOKIE: ', token);
      const token = req.url.split('?token=')[1];
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
                location: 'error catch',
              })
            );
          }
        }
      } else {
        connection.send(
          JSON.stringify({
            logout: true,
            location: 'token check',
          })
        );
      }
      // }

      // send online people to all users
      sendOnlinePeople();

      connection.on('message', async (message) => {
        if (!connection.userId) {
          connection.send(
            JSON.stringify({
              logout: true,
            })
          );
        }
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
          console.log('sender id', connection.userId);
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
    } catch (error) {
      console.log('WebSocket Connection Error: ', error);
    }
  });
};

module.exports = handleWebSocketConnection;
