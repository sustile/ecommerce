const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const { variant } = require("./variantController");

const product = mongoose.model("Product", productModel);

exports.product = product;
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const { category } = require("./categoryController");

exports.addProduct = async (req, res) => {
  try {
    const body = Object.assign(req.body, {
      createdAt: Date.now(),
      slug: slugify(req.body.title),
    });

    const prod = await product.create(body);

    res.status(200).json({
      status: "ok",
      product: prod,
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

exports.addProductImage = async (req, res) => {
  try {
    let final = req.files.map((el) => el.filename);

    await product.findOneAndUpdate(
      { _id: req.body.productId },
      {
        images: final,
      },
    );

    const prod = await product.findOne({ _id: req.body.productId });

    prod.sold = undefined;
    // prod.quantity = undefined;

    res.status(200).json({
      status: "ok",
      product: prod,
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

exports.getProductData = async (req, res) => {
  try {
    const prod = await product.findOne({ _id: req.body.productId });

    prod.sold = undefined;
    // prod.quantity = undefined;

    res.status(200).json({
      status: "ok",
      product: prod,
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

exports.getImageList = async (req, res) => {
  try {
    const prod = await product
      .findOne({ _id: req.body.productId })
      .select("images");

    // prod.sold = undefined;
    // prod.quantity = undefined;

    res.status(200).json({
      status: "ok",
      images: prod.images,
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

exports.lazyLoadProducts = async (req, res) => {
  // product.collection.updateMany(
  //   { inStock: null },
  //   {
  //     $set: {
  //       inStock: true,
  //     },
  //   },
  // );

  try {
    const body = req.body;

    if (!body) {
      res.status(400).json({
        status: "fail",
        message: "No Data Provided",
      });
      return;
    }

    console.log(body);

    const limit = 10;
    const page = (body.page - 1) * limit;

    if (!body.query) {
      res.status(400).json({
        status: "fail",
        message: "No Query Provided",
      });
      return;
    }

    //check for bestsellers
    if (
      body.query.toLowerCase() === "best seller" ||
      body.query.toLowerCase() === "best sellers"
    ) {
      let result;
      let length;

      let findBody = { sold: { $ne: 0 } };

      if (body.stockFilter.inStock && !body.stockFilter.outStock) {
        findBody["inStock"] = { $eq: true };
      } else if (!body.stockFilter.inStock && body.stockFilter.outStock) {
        findBody["inStock"] = { $eq: false };
      }

      if (body.stockFilter.inStock && !body.stockFilter.outStock) {
        findBody["inStock"] = { $eq: true };
      } else if (!body.stockFilter.inStock && body.stockFilter.outStock) {
        findBody["inStock"] = { $eq: false };
      }

      if (body.priceRange[0] !== "" && body.priceRange[1] !== "") {
        findBody["finalPrice"] = {
          $gte: body.priceRange[0],
          $lte: body.priceRange[1],
        };
      }

      let lowest = await product
        .find(findBody)
        .sort({ finalPrice: 1 })
        .limit(1);
      let highest = await product
        .find(findBody)
        .sort({ finalPrice: -1 })
        .limit(1);
      length = await product.find(findBody).count();

      if (body.sort === "" || body.sort === "Relevant") {
        result = await product
          .find(findBody)
          .sort({ sold: -1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "NameAsc") {
        result = await product
          .find(findBody)
          .sort({ slug: 1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "NameDesc") {
        result = await product
          .find(findBody)
          .sort({ slug: -1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "PriceDesc") {
        result = await product
          .find(findBody)
          .sort({ finalPrice: -1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "PriceAsc") {
        result = await product
          .find(findBody)
          .sort({ finalPrice: 1 })
          .skip(page)
          .limit(limit);
      }
      // result.skip(page).limit(limit);

      if (lowest.length === 0) {
        res.status(200).json({
          status: "ok",
          result,
          length: length,
          lowest: 0,
          highest: 0,
          priceRange: body.priceRange,
        });
        return;
      }

      res.status(200).json({
        status: "ok",
        result,
        length: length,
        lowest: lowest[0].finalPrice,
        highest: highest[0].finalPrice,
        priceRange: body.priceRange,
      });
      return;
    }

    //check for deals
    if (
      body.query.toLowerCase() === "today's deals" ||
      body.query.toLowerCase() === "today deals" ||
      body.query.toLowerCase() === "deals"
    ) {
      let result;
      let length;

      let findBody = { discount: { $ne: 0 } };

      if (body.stockFilter.inStock && !body.stockFilter.outStock) {
        findBody["inStock"] = { $eq: true };
      } else if (!body.stockFilter.inStock && body.stockFilter.outStock) {
        findBody["inStock"] = { $eq: false };
      }

      if (body.priceRange[0] !== "" && body.priceRange[1] !== "") {
        findBody["finalPrice"] = {
          $gte: body.priceRange[0],
          $lte: body.priceRange[1],
        };
      }

      let lowest = await product
        .find(findBody)
        .sort({ finalPrice: 1 })
        .limit(1);
      let highest = await product
        .find(findBody)
        .sort({ finalPrice: -1 })
        .limit(1);
      length = await product.find(findBody).count();

      if (body.sort === "" || body.sort === "Relevant") {
        result = await product
          .find(findBody)
          .sort({ discount: -1 })
          .skip(page)
          .limit(limit)
          .collation({ locale: "en_US", numericOrdering: true });
      } else if (body.sort === "NameAsc") {
        result = await product
          .find(findBody)
          .sort({ slug: 1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "NameDesc") {
        result = await product
          .find(findBody)
          .sort({ slug: -1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "PriceDesc") {
        result = await product
          .find(findBody)
          .sort({ finalPrice: -1 })
          .skip(page)
          .limit(limit);
      } else if (body.sort === "PriceAsc") {
        result = await product
          .find(findBody)
          .sort({ finalPrice: 1 })
          .skip(page)
          .limit(limit);
      }
      // result.skip(page).limit(limit);

      if (lowest.length === 0) {
        res.status(200).json({
          status: "ok",
          result,
          length: length,
          lowest: 0,
          highest: 0,
          priceRange: body.priceRange,
        });
        return;
      }

      res.status(200).json({
        status: "ok",
        result,
        length: length,
        lowest: lowest[0].finalPrice,
        highest: highest[0].finalPrice,
        priceRange: body.priceRange,
      });
      return;
    }

    let findBody = {
      $or: [
        // { hierarchy: "Audio" },
        { $text: { $search: body.query } },
      ],
    };

    if (body.stockFilter.inStock && !body.stockFilter.outStock) {
      findBody["inStock"] = { $eq: true };
    } else if (!body.stockFilter.inStock && body.stockFilter.outStock) {
      findBody["inStock"] = { $eq: false };
    }

    if (body.priceRange[0] !== "" && body.priceRange[1] !== "") {
      findBody["finalPrice"] = {
        $gte: body.priceRange[0],
        $lte: body.priceRange[1],
      };
    }
    // relevant - sort by sold

    let result;
    let length;

    let lowest = await product.find(findBody).sort({ finalPrice: 1 }).limit(1);
    let highest = await product
      .find(findBody)
      .sort({ finalPrice: -1 })
      .limit(1);
    length = await product.find(findBody).count();

    if (body.sort === "" || body.sort === "Relevant") {
      result = await product.find(findBody).skip(page).limit(limit);
    } else if (body.sort === "NameAsc") {
      result = await product
        .find(findBody)
        .sort({ slug: 1 })
        .skip(page)
        .limit(limit);
    } else if (body.sort === "NameDesc") {
      result = await product
        .find(findBody)
        .sort({ slug: -1 })
        .skip(page)
        .limit(limit);
    } else if (body.sort === "PriceDesc") {
      result = await product
        .find(findBody)
        .sort({ finalPrice: -1 })
        .skip(page)
        .limit(limit);
    } else if (body.sort === "PriceAsc") {
      result = await product
        .find(findBody)
        .sort({ finalPrice: 1 })
        .skip(page)
        .limit(limit);
    }
    // result.skip(page).limit(limit);

    if (lowest.length === 0) {
      res.status(200).json({
        status: "ok",
        result,
        length: length,
        lowest: 0,
        highest: 0,
        priceRange: body.priceRange,
      });
      return;
    }

    res.status(200).json({
      status: "ok",
      result,
      length: length,
      lowest: lowest[0].finalPrice,
      highest: highest[0].finalPrice,
      priceRange: body.priceRange,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

exports.addVariant = async (req, res) => {
  try {
    const body = req.body;

    if (!body) {
      res.status(404).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    let check = await variant.findOne({ _id: body.variants.variant });

    if (!check) {
      res.status(404).json({
        status: "fail",
        message: "No Variant with the provided ID was found",
      });
      return;
    }

    const prod = await product.findOne({ _id: body.id });

    let variants = prod.variants;
    variants.push(body.variants);

    await product.findOneAndUpdate(
      { _id: body.id },
      {
        variants,
      },
    );

    variants = check.variants;
    variants.push({
      id: body.id,
      label: body.variantLabel,
    });

    await variant.findOneAndUpdate(
      { _id: check._id },
      {
        variants,
      },
    );

    const newUser = await product.findOne({ _id: body.id });

    res.status(200).json({
      status: "ok",
      product: newUser,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getVariantsData = async (req, res) => {
  try {
    const body = req.body;

    if (!body) {
      res.status(404).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    const prod = await product.findOne({ _id: body.id });

    let finalData = [];

    for (let el of prod.variants) {
      let check = await variant.findOne({ _id: el.variant });

      if (check) {
        let f = check.variants.filter((el) => el.id === body.id);
        finalData.push({
          variant: el.variantName,
          data: f[0],
        });
      }
    }

    res.status(200).json({
      status: "ok",
      variantData: finalData,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = 25;
    const page = 0;

    let findBody = { sold: { $ne: 0 } };

    let result = await product
      .find(findBody)
      .sort({ sold: -1 })
      .skip(page)
      .limit(limit);

    // result.skip(page).limit(limit);

    res.status(200).json({
      status: "ok",
      result,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

exports.getTopDeals = async (req, res) => {
  try {
    const limit = 25;
    const page = 0;

    let findBody = { discount: { $ne: 0 } };

    let result = await product
      .find(findBody)
      .sort({ discount: -1 })
      .skip(page)
      .limit(limit)
      .collation({ locale: "en_US", numericOrdering: true });

    // result.skip(page).limit(limit);

    res.status(200).json({
      status: "ok",
      result,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

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

    const prod = await product.findOne({ _id: body.id });
    let reviews = prod.ratings;

    reviews.push({
      id: user._id,
      name: user.firstName + " " + user.lastName,
      rating: body.rating,
      review: body.review,
    });

    await product.findOneAndUpdate({ _id: body.id }, { ratings: reviews });

    res.status(200).json({
      status: "ok",
      reviews: reviews,
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

    const prod = await product.findOne({ _id: body.id });
    let reviews = prod.ratings;

    res.status(200).json({
      status: "ok",
      reviews: reviews,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};
