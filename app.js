// IMPORT MODULES
const path = require('path');
const express = require('express'); //express framework
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

// INIT EXPRESS FRAMEWORK
const app = express();
app.enable('trust proxy');

//* PUG TEMPLATE RENDERING
app.set('view engine', 'pug'); // SET THE VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));

//Implement CORS
app.use(cors()); // Access-Control-Allow-Origin *
app.options('*', cors());

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

//USE HELMET PACKAGE TO SET SECURITY HTTP HEADERS
app.use(helmet());

// DEVELOPMENT LOGGING
/* if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} */

// *RATE LIMITER
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
});

// ADD RATE LIMITER TO THE API ROUTE
app.use('/api', limiter);

// * STRIPE WEBHOOK CHECKOUT
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }), //Body must be RAW for Stripe to parse
  bookingController.webhookCheckout
);

// BODY PARSER - READ DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' })); //Limit body to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Form Parser
app.use(cookieParser());

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xssClean());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//* COMPRESSION FOR TEXT SENT TO CLIENTS
app.use(compression());

// DEVELOPMENT Middleware
/* app.use((req, res, next) => {
  //console.log(req.cookies);
  next();
}); */

// INIT ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// ROUTE HANDLER FOR NON-EXISTENT ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ADD GLOBAL ERROR HANDLER MIDDLEWARE
app.use(globalErrorHandler);

// EXPORT THIS MODULE
module.exports = app;
