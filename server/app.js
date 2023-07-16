const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT | 5001;

const start = async () => {
  try {
    app.listen(port, console.log(`Listening on port ${port}`));
  } catch (error) {
    console.log(error.message);
  }
};

start();
