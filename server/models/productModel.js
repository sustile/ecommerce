const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    hierarchy: [],
    specification: [],
    variants: {
      type: [
        {
          variantName: String,
          variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
        },
      ],
    },
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    cgst: {
      type: String,
      default: 0,
    },
    igst: {
      type: String,
      default: 0,
    },
    sgst: {
      type: String,
      default: 0,
    },
    discount: {
      type: String,
      default: 0,
    },
    category: [],
    brand: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    //sizes : {
    // name : "",
    //qty : ""
    // }
    sizes: [],
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: [String],
    tags: [String],
    ratings: [
      {
        star: String,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
    createdAt: Date,
  },
  { timestamps: true },
);

schema.index({
  title: "text",
  slug: "text",
  brand: "text",
  hierarchy: "text",
  category: "text",
});

schema.post("findByIdAndUpdate", async function (documents) {
  // console.log(this);
  this.model.find(this._conditions).then(async (documents) => {
    // console.log(documents);
    for (let el of documents) {
      let inStock = false;
      if (el.sizes.length === 0) {
        if (el.quantity > 0) {
          inStock = true;
        } else {
          inStock = false;
        }
      } else {
        let check = false;
        el.sizes.forEach((el) => {
          if (el.qty > 0) {
            check = true;
          }
        });
        inStock = check;
      }

      await this.model.updateOne({ _id: el._id }, { inStock });
    }
  });
  // if (this.sizes.length === 0) {
  //   if (this.quantity > 0) {
  //     this.inStock = true;
  //   } else {
  //     this.inStock = false;
  //}
  // } else {
  //   let check = false;
  //   this.sizes.forEach((el) => {
  //     if (el.qty > 0) {
  //       check = true;
  //     }
  //   });
  //   this.inStock = check;
  // }

  // next();
});

schema.post("findOneAndUpdate", async function (documents) {
  this.model.find(this._conditions).then(async (documents) => {
    // console.log(documents);
    for (let el of documents) {
      let inStock = false;
      if (el.sizes.length === 0) {
        if (el.quantity > 0) {
          inStock = true;
        } else {
          inStock = false;
        }
      } else {
        let check = false;
        el.sizes.forEach((el) => {
          if (el.qty > 0) {
            check = true;
          }
        });
        inStock = check;
      }

      await this.model.updateOne({ _id: el._id }, { inStock });
    }
  });
  // console.log(this);
  // if (this.sizes.length === 0) {
  //   if (this.quantity > 0) {
  //     this.inStock = true;
  //   } else {
  //     this.inStock = false;
  //   }
  // } else {
  //   let check = false;
  //   this.sizes.forEach((el) => {
  //     if (el.qty > 0) {
  //       check = true;
  //     }
  //   });
  //   this.inStock = check;
  // }
  //
  // next();
});
//
// schema.post("update", async function (next) {
//   console.log(this);
//   if (this.sizes.length === 0) {
//     if (this.quantity > 0) {
//       this.inStock = true;
//     } else {
//       this.inStock = false;
//     }
//   } else {
//     let check = false;
//     this.sizes.forEach((el) => {
//       if (el.qty > 0) {
//         check = true;
//       }
//     });
//     this.inStock = check;
//   }
//
//   next();
// });
//
// schema.post("updateOne", async function (next) {
//   console.log(this);
//   if (this.sizes.length === 0) {
//     if (this.quantity > 0) {
//       this.inStock = true;
//     } else {
//       this.inStock = false;
//     }
//   } else {
//     let check = false;
//     this.sizes.forEach((el) => {
//       if (el.qty > 0) {
//         check = true;
//       }
//     });
//     this.inStock = check;
//   }
//
//   next();
// });

schema.pre("save", async function (next) {
  if (
    !this.isModified("cgst") ||
    !this.isModified("sgst") ||
    !this.isModified("igst")
  )
    return next();

  let igst = this.price * (Number(this.igst) / 100);
  let cgst = this.price * (Number(this.igst) / 100);
  let sgst = this.price * (Number(this.igst) / 100);
  this.mrp = (this.price + igst + cgst + sgst).toFixed(2);
  this.finalPrice = (
    this.mrp.toFixed(2) -
    this.mrp.toFixed(2) * (Number(this.discount) / 100)
  ).toFixed(2);

  next();
});

module.exports = schema;
