const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const review = mongoose.model("Review", reviewModel);

exports.review = review;
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const { account } = require("./accountController");
const { product } = require("./productController");

exports.giveReview = async (req, res) => {
  try {
    let user = req.user;
    let body = req.body;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
      return;
    }

    if (!body) {
      res.status(404).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    const prod = await product.findOne({ _id: body.productId });

    if (!prod) {
      res.status(404).json({
        status: "fail",
        message: "Product Doesn't exist",
      });
      return;
    }

    //step 1 check if user can review and check if user has already reviewed

    const check = await review.findOne({
      productId: body.productId,
      user: user._id,
    });

    if (check) {
      res.status(200).json({
        status: "fail",
        message: "Review already exists",
      });
      return;
    }

    //step 2 create review and update product ratings

    let newReview = await review.create({
      user: user._id,
      productId: body.productId,
      review: body.review,
      rating: body.rating,
    });

    newReview = {
      user: user._id,
      productId: body.productId,
      review: body.review,
      rating: body.rating,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    let reviews = prod.ratings;

    reviews.push({
      postedby: user._id,
      star: body.rating,
    });

    let total = 0;

    prod.ratings.forEach((el) => {
      total += Number(el.star);
    });

    let totalrating = String((total / prod.ratings.length).toFixed(1));

    await product.findOneAndUpdate(
      { _id: body.productId },
      { ratings: reviews, totalrating },
    );

    res.status(200).json({
      status: "ok",
      reviews: reviews,
      newReview: newReview,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    let body = req.body;

    if (!body) {
      res.status(404).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    let results = await review.find({ productId: body.productId });

    let final = [];

    for (let el of results) {
      let user = await account
        .findOne({ _id: el.user })
        .select({ firstName: 1, lastName: 1 });

      if (user) {
        final.push({
          productId: el.productId,
          rating: el.rating,
          review: el.review,
          user: el.user,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      }
    }

    res.status(200).json({
      status: "ok",
      reviews: final,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};
