const orderModel = require("../models/orderModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const order = mongoose.model("Order", orderModel);

const RAZORPAY_ID = "rzp_test_UypBxGDRzAQBMo";
const RAZORPAY_SECRET = "pfbmB3fAT7iYUbBRE14UtLm7";

exports.order = order;
const path = require("path");
const fs = require("fs");
const { account } = require("./accountController");
const { product } = require("./productController");

async function updateOrderDetails(products) {
  for (let prod of products) {
    let data = await product.findOne({ _id: prod._id });
    if (data) {
      if (prod.size === "") {
        let newQty = 0;
        if (data.quantity < prod.qty) {
          return "ERROR";
        } else {
          newQty = data.quantity - prod.qty;
        }
        await product.findByIdAndUpdate(
          { _id: prod._id },
          { quantity: newQty },
        );
      } else {
        let x = data.sizes.map((el) => {
          if (el.name === prod.size) {
            let newQty = 0;
            if (el.qty < prod.qty) {
              return "ERROR";
            } else {
              newQty = el.qty - prod.qty;
            }
            return { ...el, qty: newQty };
          }
          return el;
        });

        await product.findByIdAndUpdate({ _id: prod._id }, { sizes: x });
      }
    } else {
      return "ERROR";
    }
  }
  return "";
}

async function updateSoldStock(products) {
  for (let prod of products) {
    let data = await product.findOne({ _id: prod._id });
    if (data) {
      let newSold = data.sold + prod.qty;
      await product.findByIdAndUpdate({ _id: prod._id }, { sold: newSold });
    } else {
      return "ERROR";
    }
  }
  return "";
}

async function releaseFrozenOrderDetails(id) {
  let orderData = await order.findById({ _id: id });
  if (!orderData) {
    return "ERROR";
  }
  let products = orderData.products;

  for (let prod of products) {
    let data = await product.findOne({ _id: prod._id });
    if (data) {
      if (prod.size === "") {
        let newQty = 0;

        newQty = data.quantity + prod.qty;
        await product.findByIdAndUpdate(
          { _id: prod._id },
          { quantity: newQty },
        );
      } else {
        let x = data.sizes.map((el) => {
          if (el.name === prod.size) {
            let newQty = 0;
            newQty = el.qty + prod.qty;
            return { ...el, qty: newQty };
          }
          return el;
        });

        await product.findByIdAndUpdate({ _id: prod._id }, { sizes: x });
      }
    } else {
      return "ERROR";
    }
  }
  return "";
}

async function confirmAvailability(products) {
  for (let prod of products) {
    let data = await product.findOne({ _id: prod._id });
    if (data) {
      if (prod.size === "") {
        if (data.quantity < prod.qty || data.quantity === 0) {
          return "NO QTY";
        }
      } else {
        let x = data.sizes.filter((el) => el.name === prod.size);
        if (x.length === 0) {
          return "ERROR";
        } else {
          x = x[0];
          if (x.qty < prod.qty || x.qty === 0) {
            return "NO QTY";
          }
        }
      }
    } else {
      return "ERROR";
    }
  }
  return "";
}

exports.raiseNewSalesOrder = async (req, res) => {
  try {
    const user = req.user;
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
        message: "No Payment data was Found",
      });
      return;
    }

    if (body.paymentMode === "RazorPay") {
      let razr = new Razorpay({
        key_id: RAZORPAY_ID,
        key_secret: RAZORPAY_SECRET,
      });

      let orderId = new mongoose.Types.ObjectId();

      let razrOptions = {
        amount: (body.mrp * 100).toFixed(0),
        currency: "INR",
        receipt: orderId._id.toString(),
      };

      const razrOrder = await razr.orders.create(razrOptions);

      body = Object.assign(req.body, {
        _id: orderId,
        orderby: user._id,
        tax: body.mrp - body.price,
        razorPayPaymentId: razrOrder.id,
      });

      const newOrder = await order.create(body);

      let result = await confirmAvailability(body.products);
      if (result === "NO QTY") {
        res.status(200).json({
          status: "fail",
          message: "Stock Not Available",
        });
        return;
      } else if (result === "ERROR") {
        res.status(200).json({
          status: "fail",
          message: "Something Went Wrong",
        });
        return;
      }
      await updateOrderDetails(body.products);

      if (result === "ERROR") {
        res.status(200).json({
          status: "fail",
          message: "Something Went Wrong",
        });
        return;
      }

      res.status(200).json({
        status: "ok",
        order: newOrder,
        paymentDetails: { ...razrOrder, key: RAZORPAY_ID },
      });
    } else {
      let orderId = new mongoose.Types.ObjectId();

      body = Object.assign(req.body, {
        _id: orderId,
        orderby: user._id,
        tax: body.mrp - body.price,
        orderStatus: "Processing",
      });

      let result = await confirmAvailability(body.products);
      if (result === "NO QTY") {
        res.status(200).json({
          status: "fail",
          message: "Stock Not Available",
        });
        return;
      } else if (result === "ERROR") {
        res.status(200).json({
          status: "fail",
          message: "Something Went Wrong",
        });
        return;
      }

      const newOrder = await order.create(body);

      await account.findByIdAndUpdate({ _id: user._id }, { cart: [] });

      await updateOrderDetails(body.products);

      await updateSoldStock(body.products);

      if (result === "ERROR") {
        res.status(200).json({
          status: "fail",
          message: "Something Went Wrong",
        });
        return;
      }

      res.status(200).json({
        status: "ok",
        order: newOrder,
      });
    }
  } catch (err) {
    console.log(err);
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

exports.validatePayment = async (req, res) => {
  try {
    const user = req.user;
    let body = req.body;

    if (!user) {
      res.status(200).json({
        status: "fail",
        message: "No User was Found",
      });
      return;
    }

    if (!body) {
      res.status(200).json({
        status: "fail",
        message: "No Payment data was Found",
      });
      return;
    }

    const sha = crypto.createHmac("sha256", RAZORPAY_SECRET);
    sha.update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`);

    const digest = sha.digest("hex");
    if (digest !== body.razorpay_signature) {
      //invalid
      res.status(200).json({
        status: "fail",
        message: "Invalid Signature",
      });

      await releaseFrozenOrderDetails(body.receiptId);

      await order.deleteOne({ id: body.receiptId });

      return;
    } else {
      //valid
      //check if the payment data matches and update values in db

      let orderData = await order.findOne({ _id: body.receiptId });
      if (orderData) {
        if (orderData.razorPayPaymentId === body.razorpay_order_id) {
          console.log(user._id, orderData.orderby);
          if (user._id.toString() === orderData.orderby.toString()) {
            await order.findByIdAndUpdate(
              { _id: body.receiptId },
              {
                paymentFulfilled: true,
                orderStatus: "Processing",
                razorPayDetails: { ...body },
              },
            );

            await account.findByIdAndUpdate({ _id: user._id }, { cart: [] });

            await updateSoldStock(orderData.products);

            res.status(200).json({
              status: "ok",
            });
          } else {
            await releaseFrozenOrderDetails(body.receiptId);

            await order.deleteOne({ id: body.receiptId });

            res.status(200).json({
              status: "fail",
              message: "USERDATA didn't match.",
            });
          }
        } else {
          await releaseFrozenOrderDetails(body.receiptId);

          await order.deleteOne({ id: body.receiptId });

          res.status(200).json({
            status: "fail",
            message:
              "Payment ID didn't Match. Please Contact Support for more info.",
          });
        }
      } else {
        await order.deleteOne({ id: body.receiptId });

        res.status(200).json({
          status: "fail",
          message:
            "Order Receipt Doesn't Exist. Please Contact Support for more info.",
        });
      }
    }
  } catch (err) {
    console.log(err);
    let message = "Something Went Wrong";
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};

exports.paymentFailed = async (req, res) => {
  try {
    const user = req.user;
    let body = req.body;

    if (!user) {
      res.status(200).json({
        status: "fail",
        message: "No User was Found",
      });
      return;
    }

    if (!body) {
      res.status(200).json({
        status: "fail",
        message: "No Payment data was Found",
      });
      return;
    }
    let orderData = await order.findOne({ _id: body.receiptId });

    if (orderData) {
      if (orderData.orderby.toString() === user._id.toString()) {
        await releaseFrozenOrderDetails(body.receiptId);

        await order.deleteOne({ _id: body.receiptId });

        res.status(200).json({
          status: "ok",
        });
      } else {
        res.status(200).json({
          status: "fail",
          message: "User Does not Match",
        });
      }
    } else {
      res.status(200).json({
        status: "fail",
        message: "Receipt does not exist",
      });
    }
  } catch (err) {
    console.log(err);
    let message = "Something Went Wrong";
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};

exports.lazyLoadOrders = async (req, res) => {
  try {
    const body = req.body;
    const user = req.user;

    if (!body) {
      res.status(400).json({
        status: "fail",
        message: "No Data Provided",
      });
      return;
    }

    const limit = 30;
    const page = (body.page - 1) * limit;

    const result = await order
      .find({ orderby: user._id })
      .sort({ createdAt: -1 })
      .skip(page)
      .limit(limit);

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

exports.checkIfBought = async (req, res) => {
  try {
    let body = req.body;
    let user = req.user;

    if (!body) {
      res.status(404).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    const prod = await order.find({ orderby: user._id });

    let check = false;
    prod.forEach((el) => {
      let x = el.products.filter((el2) => el2._id === body.productId);
      if (x.length > 0) {
        check = true;
      }
    });

    res.status(200).json({
      status: "ok",
      bought: check,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};
