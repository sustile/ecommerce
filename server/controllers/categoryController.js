const categoryModel = require("../models/categoryModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const category = mongoose.model("Category", categoryModel);

exports.category = category;

const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

exports.addCategory = async (req, res) => {
  try {
    const body = req.body;

    const prod = await category.create(body);

    res.status(200).json({
      status: "ok",
      category: prod,
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

exports.getCategories = async (req, res) => {
  try {
    const prod = await category.find();

    res.status(200).json({
      status: "ok",
      category: prod,
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
