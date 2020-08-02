//* IMPORTS
const mongoose = require('mongoose');

// *SCHEMA
const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

//* INDEXES
//None

// *STATIC METHODS
//None

// *VIRTUAL PROPERTIES
//None

//* DOCUMENT MIDDLEWARE
//None

//* QUERY MIDDLEWARE
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
  next();
});

//* AGGREGATE MIDDLEWARE
//None

//* CREATE EXPORT MODEL
const Booking = mongoose.model('Booking', bookingSchema);

//* EXPORT THIS MODULE
module.exports = Booking;
