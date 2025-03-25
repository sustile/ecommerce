const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    user: String,
    productId: String,
    review: String,
    rating: {
      type: String,
      default: 0,
    },
    createdAt: Date,
  },
  { timestams: true },
);

module.exports = schema;
