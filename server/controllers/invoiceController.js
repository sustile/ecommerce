const invoiceModel = require("../models/invoiceModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");

const invoice = mongoose.model("Invoice", invoiceModel);

exports.invoice = invoice;
const path = require("path");
const fs = require("fs");
