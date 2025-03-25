const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    products: [],
    orderStatus: {
      type: String,
      default: "Payment Pending",
      enum: [
        "Payment Pending",
        "Processing",
        "Shipped",
        "Cancelled",
        "Out for Delivery",
        "Delivered",
      ],
    },
    paymentFulfilled: {
      type: Boolean,
      default: false,
    },
    paymentMode: {
      type: String,
      default: "",
      enum: ["RazorPay", "Cash on Delivery"],
    },
    razorPayPaymentId: {
      type: String,
      default: "",
    },
    razorPayDetails: {},
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryDetails: {},
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = schema;
