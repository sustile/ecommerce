const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    variants: [],
  },
  {
    timestamps: true,
  },
);

module.exports = schema;
