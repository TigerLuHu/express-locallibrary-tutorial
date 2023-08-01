const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');

const app = express();
const limiter = RateLimit({
  windowms: 1*60*1000, // 1min
  max: 20
});

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);

const dev_db_url = "mongodb://127.0.0.1:27017/local_library"
const mongodb = process.env.MONGODN_URL || dev_db_url ||

main().catch((err) => {
  console.log(err);
})

async function main() {
  await mongoose.connect(mongodb);
}

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", "code.jquery.com", "cdn.jsdelivr.net"]
    }
  })
)

// Apply rate limiter to all requests
app.use(limiter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.user(compression()) // Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;