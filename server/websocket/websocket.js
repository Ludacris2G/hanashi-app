const ws = require('ws');

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
        console.log(token);
      }
    }
  });
};

module.exports = handleWebSocketConnection;
