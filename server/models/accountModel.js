const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gst: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: Array,
      default: [],
    },
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    refreshToken: {
      type: String,
    },
    creation: {
      type: Date,
      required: [true, "An Account Must Have a Creation Date"],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// schema.methods.passwordChanged = (jwt) => {
//   if (this.passwordChangedAt) {
//     const time = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

//     return jwt < time;
//   }

//   // FALSE MEANS NOT CHANGED
//   return false;
// };

module.exports = schema;
