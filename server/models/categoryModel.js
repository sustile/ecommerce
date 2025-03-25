const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subCategories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: [],
    tags: String,
  },
  { timestamps: true },
);

schema.index({ title: "text" });

module.exports = schema;
