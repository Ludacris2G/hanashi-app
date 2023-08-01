require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
// potentiial rate limit reminder <----

const express = require('express');
const app = express();
const ws = require('ws');

// connectDB
const connectDB = require('./db/connect');

// routers
const authRouter = require('./routes/auth');

// cookies
const cookieParser = require('cookie-parser');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler.js');
const handleWebSocketConnection = require('./websocket/websocket');

// app use
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);
app.use(xss());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Works' });
});

// routes
app.use('/api/v1/auth', authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5001;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const server = app.listen(port, () =>
      console.log(`Listening on port ${port}`)
    );

    handleWebSocketConnection(server);
  } catch (error) {
    console.log(error.message);
  }
};

start();
