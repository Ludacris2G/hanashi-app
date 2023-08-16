const { StatusCodes } = require('http-status-codes');

const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, secure: true });
  res.status(StatusCodes.OK).json({ msg: 'logged out' });
};

module.exports = { logout };
