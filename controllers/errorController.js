const AppError = require('../utils/appError');

const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handelDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Field Value: ${value}. Please use another value!`;
  return new AppError(message, 404);
};

const handelValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 404);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    msg: err.message,
  });
};

const handelJWTError = () =>
  new AppError('Invalid token. Please login again!', 401);

const handelJWTExpiredError = () =>
  new AppError('Your Token has expired. Please login again!', 401);

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or unknown error: dont leak error details
    //1) Log Error
    console.error('ERROR', err);

    //2) send Generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  // A) operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: err.message,
    });
  }
  // B) Programming or unknown error: dont leak error details
  //1) Log Error
  console.error('ERROR', err);

  //2) send Generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV != 'development') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handelCastErrorDB(error);
    if (error.code === 11000) error = handelDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handelValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handelJWTError();
    if (error.name === 'TokenExpiredError') error = handelJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
