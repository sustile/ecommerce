const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true },
);

module.exports = schema;
