const variantModel = require("../models/variantModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const variant = mongoose.model("Variant", variantModel);

exports.variant = variant;
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

exports.createVariant = async (req, res) => {
  try {
    // const body = Object.assign(req.body);

    const prod = await variant.create({});

    res.status(200).json({
      status: "ok",
      variant: prod,
    });
  } catch (err) {
    let message = "Something Went Wrong";
    if (err.message.includes("duplicate key")) {
      message = "Email already in use";
    }
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};

exports.getVariantData = async (req, res) => {
  try {
    const prod = await variant.findOne({ _id: req.body.id });

    // prod.sold = undefined;
    // prod.quantity = undefined;

    res.status(200).json({
      status: "ok",
      variants: prod,
    });
  } catch (err) {
    let message = "Something Went Wrong";
    if (err.message.includes("duplicate key")) {
      message = "Email already in use";
    }
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};
