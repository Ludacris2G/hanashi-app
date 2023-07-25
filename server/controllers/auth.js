const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const UnauthenticatedError = require('../errors/unauthenticated');

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res
    .cookie('token', token, { httpOnly: true, secure: true })
    .status(StatusCodes.CREATED)
    .json({ user: { id: user._id, username: user.username } });
};

const verifyToken = (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(StatusCodes.OK).json({ decoded });
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Invalid or expired token' });
  }
};

module.exports = { register, verifyToken };
