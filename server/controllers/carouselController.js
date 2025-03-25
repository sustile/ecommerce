const carouselModel = require("../models/carouselModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const carousel = mongoose.model("Carousel", carouselModel);

exports.carousel = carousel;

const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

exports.setCarousel = async (req, res) => {
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

    await carousel.findOneAndUpdate(
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

exports.getCarousel = async (req, res) => {
  try {
    const data = await carousel.findOne({ title: "MainCarousel" });

    res.status(200).json({
      status: "ok",
      carousel: data,
    });
  } catch (err) {
    let message = "Something Went Wrong";
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};
