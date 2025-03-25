const accountModel = require("../models/accountModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const account = mongoose.model("User", accountModel);

const JWT_EXPIRE_COOKIE = 10;

exports.account = account;
const path = require("path");
const fs = require("fs");
const { product } = require("./productController");

exports.createAccount = async (req, res) => {
  try {
    const body = Object.assign(req.body, {
      creation: Date.now(),
      // wishlist: [],
      // cart: [],
      // isBlocked: false,
      // role: "user",
      // mobile: "",
    });

    const newAcc = await account.create(body);

    const token = jwt.generate(newAcc.id);

    res.cookie("jwt", token, {
      maxAge: JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000,
      // secure: true, //only when deploying or testing in website not in postman
      httpOnly: true,
    });

    newAcc.password = undefined;

    res.status(200).json({
      status: "ok",
      newAcc,
    });
  } catch (err) {
    let message = "Something Went Wrong";
    if (err.message.includes("duplicate key")) {
      message = "Email already in use";
    }
    res.status(200).json({
      status: "fail",
      message,
    });
  }
};

exports.loginAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Provide a Valid Email and Password");
    }

    const user = await account.findOne({ email }).select("+password");
    const pass = await bcrypt.compare(password, user.password);

    if (!user || !pass) {
      throw new Error("Invalid Email or Password");
    }

    const token = jwt.generate(user._id);

    res.cookie("jwt", token, {
      maxAge: process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000,
      // secure: true, //only when deploying or testing in website not in postman
      httpOnly: true,
    });

    res.status(200).send({
      status: "ok",
    });
  } catch (err) {
    res.status(200).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBasicData = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    } else {
      res.status(200).json({
        status: "ok",
        user: {
          createdAt: user.createdAt,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.mobile,
          role: user.role,
          email: user.email,
          cart: user.cart,
          wishlist: user.wishlist,
          address: user.address,
          gst: user.gst,
          _id: user._id,
        },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBasicDataUnrouted = async (req, res) => {
  try {
    const user = req.user;

    console.log("getBasicDataUnrouted");

    if (!user) {
      res.status(200).json({
        status: "fail",
        message: "No User Found",
      });
    } else {
      res.status(200).json({
        status: "ok",
        user: {
          createdAt: user.createdAt,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.mobile,
          role: user.role,
          email: user.email,
          cart: user.cart,
          wishlist: user.wishlist,
          address: user.address,
          gst: user.gst,
          _id: user._id,
        },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUserBasicData = async (req, res) => {
  try {
    const user = await account.findOne({ _id: req.body.id });

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      res.status(200).json({
        status: "ok",
        user: {
          name: user.name,
          image: user.image,
          coverImage: user.coverImage,
          aboutMe: user.aboutMe,
        },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.changeData = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

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

    await account.findOneAndUpdate(
      { _id: user.id },
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        gst: body.gst,
        mobile: body.phone,
      },
    );
    const newUser = await account.findOne({ _id: user.id });

    res.status(200).json({
      status: "ok",
      user: {
        createdAt: newUser.createdAt,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        mobile: newUser.mobile,
        role: newUser.role,
        email: newUser.email,
        cart: newUser.cart,
        wishlist: newUser.wishlist,
        address: newUser.address,
        gst: newUser.gst,
        _id: user.id,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.removeAddress = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

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

    let found = false;
    let final = [];
    user.address.forEach((el) => {
      if (!found) {
        if (
          el.name === body.name &&
          el.mobile === body.mobile &&
          el.address === body.address &&
          el.city === body.city &&
          el.pincode === body.pincode &&
          el.state === body.state
        ) {
          found = true;
        } else {
          final.push(el);
        }
      } else {
        final.push(el);
      }
    });

    await account.findOneAndUpdate(
      { _id: user.id },
      {
        address: final,
      },
    );
    const newUser = await account.findOne({ _id: user.id });

    res.status(200).json({
      status: "ok",
      user: {
        createdAt: newUser.createdAt,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        mobile: newUser.mobile,
        role: newUser.role,
        email: newUser.email,
        cart: newUser.cart,
        wishlist: newUser.wishlist,
        address: newUser.address,
        gst: newUser.gst,
        _id: user.id,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

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
    // {name, mobile, address, city, state, pincode}

    let address = user.address;
    address.push(body);

    await account.findOneAndUpdate(
      { _id: user.id },
      {
        address,
      },
    );
    const newUser = await account.findOne({ _id: user.id });

    res.status(200).json({
      status: "ok",
      user: {
        createdAt: newUser.createdAt,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        mobile: newUser.mobile,
        role: newUser.role,
        email: newUser.email,
        cart: newUser.cart,
        wishlist: newUser.wishlist,
        address: newUser.address,
        gst: newUser.gst,
        _id: user.id,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.changeSecondaryData = async (req, res) => {
  // try {
  const user = req.user;
  const file = req.file;
  const body = req.body;

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
  if (file) {
    fs.copyFileSync(
      file.path,
      path.join(__dirname, "./../../build/Images/" + file.filename),
    );
  }
  if (
    file &&
    user.coverImage !== "undefined" &&
    file.filename !== user.coverImage
  ) {
    fs.unlinkSync(
      path.join(__dirname, "./../../build/Images/" + user.coverImage),
    );
    fs.unlinkSync(
      path.join(__dirname, "./../../public/Images/" + user.coverImage),
    );
  }
  await account.findOneAndUpdate(
    { _id: user.id },
    {
      aboutMe: body.aboutMe !== "undefined" ? body.aboutMe : user.aboutMe,
      coverImage: file?.filename || user.coverImage,
    },
  );
  res.status(200).json({
    status: "ok",
  });
};

exports.checkUserExists = async (req, res) => {
  try {
    let user = await account.findOne({ _id: req.body.id }).select("name");

    if (user) {
      res.status(200).json({
        status: "ok",
        name: user.name,
      });
    } else {
      res.status(200).json({
        status: "fail",
      });
    }
  } catch (err) {
    res.status(200).json({
      status: "fail",
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    let user = req.user;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
      return;
    }

    res.status(200).json({
      status: "ok",
      cart: user.cart,
    });
  } catch (err) {
    res.status(200).json({
      status: "fail",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

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

    // {productId, qty , size}
    console.log(body);
    const prod = await product.findOne({ _id: body.productId });

    if (!prod) {
      res.status(404).json({
        status: "fail",
        message: "Product Not Found",
      });
      return;
    }

    if (!body.size) {
      if (prod.quantity === 0) {
        res.status(404).json({
          status: "fail",
          message: "Out of stock",
        });
        return;
      }

      let checkIfExists = user.cart.filter(
        (el) => el.productId === body.productId,
      );

      let finalQty = 0;
      let maxQtyReached = false;

      if (checkIfExists.length > 0) {
        finalQty = checkIfExists[0].qty + body.qty;
      } else {
        finalQty = body.qty;
      }

      if (finalQty > prod.quantity) {
        body.qty = prod.quantity;
        maxQtyReached = true;
      } else {
        body.qty = finalQty;
      }

      let finalCart;

      if (checkIfExists.length > 0) {
        finalCart = user.cart.map((el) => {
          if (el.productId === body.productId) {
            return { ...el, qty: body.qty };
          }
          return el;
        });
      } else {
        finalCart = [...user.cart, body];
      }

      await account.findOneAndUpdate(
        { _id: user.id },
        {
          cart: finalCart,
        },
      );

      res.status(200).json({
        status: "ok",
        cart: finalCart,
      });
    } else {
      let sizeQty = prod.sizes.filter((el) => el.name === body.size);

      if (sizeQty.length === 0) {
        res.status(404).json({
          status: "fail",
          message: "Size doesn't exist",
        });
        return;
      }

      sizeQty = sizeQty[0].qty;

      if (sizeQty === 0) {
        res.status(404).json({
          status: "fail",
          message: "Size out of Stock",
        });
        return;
      }

      let checkIfExists = user.cart.filter(
        (el) =>
          el.size && el.size === body.size && el.productId === body.productId,
      );

      let finalQty = 0;

      if (checkIfExists.length > 0) {
        finalQty = checkIfExists[0].qty + body.qty;
      } else {
        finalQty = body.qty;
      }

      if (finalQty > sizeQty) {
        body.qty = sizeQty;
      } else {
        body.qty = finalQty;
      }

      let finalCart;

      if (checkIfExists.length > 0) {
        finalCart = user.cart.map((el) => {
          if (
            el.productId === body.productId &&
            el.size &&
            el.size === body.size
          ) {
            return { ...el, qty: body.qty };
          }
          return el;
        });
      } else {
        finalCart = [...user.cart, body];
      }

      await account.findOneAndUpdate(
        { _id: user.id },
        {
          cart: finalCart,
        },
      );

      res.status(200).json({
        status: "ok",
        cart: finalCart,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.setCartQty = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

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

    // {productId, qty , size}
    const prod = await product.findOne({ _id: body.productId });

    if (!prod) {
      res.status(404).json({
        status: "fail",
        message: "Product Not Found",
      });
      return;
    }

    if (!body.size) {
      if (prod.quantity === 0) {
        res.status(404).json({
          status: "fail",
          message: "Out of stock",
        });
        return;
      }

      let checkIfExists = user.cart.filter(
        (el) => el.productId === body.productId,
      );

      let finalQty = 0;

      // if (checkIfExists.length > 0) {
      //   finalQty = checkIfExists[0].qty + body.qty;
      // } else {
      finalQty = body.qty;
      // }

      if (finalQty > prod.quantity) {
        body.qty = prod.quantity;
      } else {
        body.qty = finalQty;
      }

      let finalCart;

      if (checkIfExists.length > 0) {
        finalCart = user.cart.map((el) => {
          if (el.productId === body.productId) {
            return { ...el, qty: body.qty };
          }
          return el;
        });
      } else {
        finalCart = [...user.cart, body];
      }

      await account.findOneAndUpdate(
        { _id: user.id },
        {
          cart: finalCart,
        },
      );

      res.status(200).json({
        status: "ok",
        cart: finalCart,
      });
    } else {
      let sizeQty = prod.sizes.filter((el) => el.name === body.size);

      if (sizeQty.length === 0) {
        res.status(404).json({
          status: "fail",
          message: "Size doesn't exist",
        });
        return;
      }

      sizeQty = sizeQty[0].qty;

      if (sizeQty === 0) {
        res.status(404).json({
          status: "fail",
          message: "Size out of Stock",
        });
        return;
      }

      let checkIfExists = user.cart.filter(
        (el) =>
          el.size && el.size === body.size && el.productId === body.productId,
      );

      let finalQty = 0;

      // if (checkIfExists.length > 0) {
      //   finalQty = checkIfExists[0].qty + body.qty;
      // } else {
      finalQty = body.qty;
      // }

      if (finalQty > sizeQty) {
        body.qty = sizeQty;
      } else {
        body.qty = finalQty;
      }

      let finalCart;

      if (checkIfExists.length > 0) {
        finalCart = user.cart.map((el) => {
          if (
            el.productId === body.productId &&
            el.size &&
            el.size === body.size
          ) {
            return { ...el, qty: body.qty };
          }
          return el;
        });
      } else {
        finalCart = [...user.cart, body];
      }

      await account.findOneAndUpdate(
        { _id: user.id },
        {
          cart: finalCart,
        },
      );

      res.status(200).json({
        status: "ok",
        cart: finalCart,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

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

    // {productId , size}
    const prod = await product.findOne({ _id: body.productId });

    if (!prod) {
      res.status(404).json({
        status: "fail",
        message: "Product Not Found",
      });
      return;
    }

    let checkIfExists = user.cart.filter((el) => {
      if (el.size !== body.size || el.productId !== body.productId) {
        return el;
      }
    });

    await account.findOneAndUpdate(
      { _id: user.id },
      {
        cart: checkIfExists,
      },
    );

    res.status(200).json({
      status: "ok",
      cart: checkIfExists,
    });
    // }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.calculateCart = async (req, res) => {
  try {
    const user = req.user;

    let cart = user.cart;

    let priceTotal = 0;
    let taxTotal = 0;

    let cartData = [];

    for (let el of cart) {
      let data = await product.findOne({ _id: el.productId });
      // console.log(data);
      cartData.push({
        ...data._doc,
        ...el,
      });
    }

    cartData.forEach((el) => {
      priceTotal += el.qty * (el.price - el.price * (el.discount / 100));

      taxTotal +=
        el.qty *
        (el.mrp - el.price - (el.mrp - el.price) * (el.discount / 100));
    });

    taxTotal = taxTotal.toFixed(2);
    priceTotal = priceTotal.toFixed(2);

    res.status(200).json({
      status: "ok",
      total: {
        price: priceTotal,
        tax: taxTotal,
        amount: (Number(priceTotal) + Number(taxTotal)).toFixed(2),
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};
