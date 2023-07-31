const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res
    .cookie('token', token, { httpOnly: true, secure: true })
    .status(StatusCodes.CREATED)
    .json({ user: { id: user._id, username: user.username }, token });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ username }, '-passowrd');

  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const token = await user.createJWT();

  res
    .cookie('token', token, { httpOnly: true, secure: true })
    .status(StatusCodes.OK)
    .json({ token });
};

const verifyToken = (req, res) => {
  // add error response msg to frontend
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Unauthorized');
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(StatusCodes.OK).json({ decoded });
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Invalid or expired token' });
  }
};

module.exports = { register, verifyToken, login };
