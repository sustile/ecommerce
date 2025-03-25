const express = require("express");
const router = express.Router();
const { verify, verifyDisable } = require("./../middlewares/middleware");
const path = require("path");

const accountController = require("../controllers/accountController");
const invoiceController = require("../controllers/invoiceController");
const orderController = require("../controllers/orderController");
const productController = require("../controllers/productController");
const variantController = require("../controllers/variantController");
const categoryController = require("../controllers/categoryController");
const carouselController = require("../controllers/carouselController");
const bannerController = require("../controllers/bannerController");
const reviewController = require("../controllers/reviewController");

// MULTER
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "./../../Products/Images"));
  },

  filename: (req, file, cb) => {
    if (req.path === "/api/changeSecondaryData") {
      console.log(
        "yes",
        req.user.id + "_COVER" + path.extname(file.originalname),
      );
      cb(null, req.user.id + "_COVER" + path.extname(file.originalname));
    } else {
      cb(
        null,
        req.body.productId +
          "-" +
          req.files.length +
          path.extname(file.originalname),
      );
    }
  },
});

const uploadImage = multer({ storage: storage });
// const uploadImage2 = multer({ storage: storageB });
// MULTER
router.route("/api/signup").post(accountController.createAccount);

router.route("/api/login").post(accountController.loginAccount);

// GET BASIC DATA ABOUT THE USER
router.route("/api/getBasicData").get(verify, accountController.getBasicData);

// GET BASIC DATA ABOUT THE USER
router
  .route("/api/getBasicDataUnrouted")
  .get(verifyDisable, accountController.getBasicDataUnrouted);

// GET BASIC DATA ABOUT THE SOME OTHER USER
router
  .route("/api/getUserBasicData")
  .post(verify, accountController.getUserBasicData);

// CHANGE NAME AND IMAGE OF AN USER
router.route("/api/changeData").post(verify, accountController.changeData);

// REMOVE ADDRESS
router
  .route("/api/removeAddress")
  .post(verify, accountController.removeAddress);

// ADD ADDRESS
router.route("/api/addAddress").post(verify, accountController.addAddress);

// ADD PRODUCT
router.route("/api/addProduct").post(productController.addProduct);

// ADD PRODUCT IMAGE
router
  .route("/api/addProductImage")
  .post(uploadImage.array("photos", 12), productController.addProductImage);

// GET SINGLE PRODUCT DATA
router.route("/api/getProductData").post(productController.getProductData);

// GET SINGLE PRODUCT DATA IMAGE LIST
router.route("/api/getImageList").post(productController.getImageList);

// LAZY LOAD PRODUCT DATA
router.route("/api/lazyLoadProducts").post(productController.lazyLoadProducts);

// GET VARIANT DATA
router.route("/api/getVariantData").post(variantController.getVariantData);

// CREATE NEW VARIANT
router.route("/api/createVariant").get(variantController.createVariant);

// GET VARIANT DATAS
router.route("/api/getVariantsData").post(productController.getVariantsData);

// ADD VARIANT TO A PRODUCT
router.route("/api/addVariant").post(productController.addVariant);

//ADD ITEM TO CART
router.route("/api/addToCart").post(verify, accountController.addToCart);

//SET QTY CART
router.route("/api/setCartQty").post(verify, accountController.setCartQty);

//REMOVE ITEM FROM CART
router
  .route("/api/removeItemFromCart")
  .post(verify, accountController.removeItemFromCart);

//GET CART
router.route("/api/getCart").get(verify, accountController.getCart);
// router.route("/api/getCart").get(verifyDisable, accountController.getCart);

//GET CART UNVERIFIED
router
  .route("/api/getCartUnrouted")
  .get(verifyDisable, accountController.getCart);

//GET CART TOTAL
router.route("/api/calculateCart").get(verify, accountController.calculateCart);

//CREATE A NEW ORDER
router
  .route("/api/raiseNewSalesOrder")
  .post(verify, orderController.raiseNewSalesOrder);

//VALIDATE PAYMENT FOR AN ORDER
router
  .route("/api/validatePayment")
  .post(verify, orderController.validatePayment);

//PAYMENT FAILED FOR AN ORDER
router.route("/api/paymentFailed").post(verify, orderController.paymentFailed);

//LAZY LOAD ORDER DATA
router
  .route("/api/lazyLoadOrders")
  .post(verify, orderController.lazyLoadOrders);

//GET CATEGORY LIST
router.route("/api/getCategories").get(categoryController.getCategories);

//ADD CATEGORY
router.route("/api/addCategory").post(categoryController.addCategory);

//GET BEST SELLERS
router.route("/api/getBestSellers").get(productController.getBestSellers);

//GET TOP DEALS
router.route("/api/getTopDeals").get(productController.getTopDeals);

//GET MAIN CAROUSEL
router.route("/api/getCarousel").get(carouselController.getCarousel);

//SET MAIN CAROUSEL
router.route("/api/setCarousel").post(carouselController.setCarousel);

//CHECK IF BOUGHT
router.route("/api/checkIfBought").post(verify, orderController.checkIfBought);

//GET MAIN BANNERS
router.route("/api/getMainBanners").get(bannerController.getMainBanners);

//GIVE REVIEW
router.route("/api/giveReview").post(verify, reviewController.giveReview);

//GET REVIEWS
router.route("/api/getReviews").post(reviewController.getReviews);

router
  .route("/api/changeSecondaryData")
  .post(
    verify,
    uploadImage.single("image"),
    accountController.changeSecondaryData,
  );

router.route("/api/checkUserExists").post(accountController.checkUserExists);

module.exports = router;
