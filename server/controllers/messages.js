const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const getMessages = async (req, res) => {
  const selectedUserId = req.params.query;

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Unauthorized');
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ourUserId = decoded.userId;

    const messages = await Message.find({
      sender: {
        $in: [selectedUserId, ourUserId],
      },
      recipient: {
        $in: [selectedUserId, ourUserId],
      },
    }).sort({ createdAt: 1 });

    res.status(StatusCodes.OK).json({ messages: messages });
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: 'Invalid or expired token' });
  }
};

module.exports = { getMessages };
