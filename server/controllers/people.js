const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const getPeople = async (req, res) => {
  const people = await User.find({});
  res.status(StatusCodes.OK).json({ people });
};

module.exports = { getPeople };
