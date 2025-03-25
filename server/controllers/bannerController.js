const bannerModel = require("../models/bannerModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const banner = mongoose.model("Banner", bannerModel);

exports.banner = banner;

const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

exports.setBanner = async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      res.status(400).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    let images = body.images;

    await banner.findOneAndUpdate(
      { title: "MainCarousel" },
      { images: images },
    );

    res.status(200).json({
      status: "ok",
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

exports.getMainBanners = async (req, res) => {
  try {
    const data = await banner.find({ title: "MainBanner" });

    res.status(200).json({
      status: "ok",
      banner: data,
    });
  } catch (err) {
    let message = "Something Went Wrong";
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};
