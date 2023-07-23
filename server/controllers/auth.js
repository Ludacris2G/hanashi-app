const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res
    .cookie('token', token)
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.username }, token });
};

module.exports = { register };
