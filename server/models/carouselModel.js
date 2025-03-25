const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "MainCarousel" },
    images: [
      {
        link: String,
        url: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = schema;
