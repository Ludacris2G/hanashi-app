const express = require('express');
const app = express();
require('dotenv').config();

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
// potentiial rate limit reminder <----

// connectDB
const connectDB = require('./db/connect');

// routers

// error handler

app.set('trust proxy', 1);

// app use
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Works' });
});

const port = process.env.PORT | 5001;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Listening on port ${port}`));
  } catch (error) {
    console.log(error.message);
  }
};

start();
