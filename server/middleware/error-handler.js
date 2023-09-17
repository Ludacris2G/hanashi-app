const { StatusCodes } = require('http-status-codes');
const errorHandlerMiddleware = (err, req, res, next) => {
  // default error
  console.log(err.errors);
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again later',
  };

  // Check if the error is due to a duplicate key (e.g., user already exists)
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = 'User already exists';
  }

  // Check if the error is related to the 'password' field and its minimum length requirement
  if (
    err.errors?.password?.properties?.path === 'password' &&
    err.errors?.password?.properties?.minlength
  ) {
    customError.msg = 'Password should be at least 6 characters long.';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Check if the error is related to the 'username' field and its minimum length requirement
  if (
    err.errors?.username?.properties?.path === 'username' &&
    err.errors?.username?.properties?.minlength
  ) {
    customError.msg = 'Username should be at least 3 characters long.';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Check for exceeded length in username when registering
  if (
    err.errors?.username?.properties?.type === 'maxlength' &&
    err.errors?.username?.properties?.path === 'username'
  ) {
    customError.msg = 'Username exceeds 12 characters.';
  }

  // Send the custom error response
  res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
