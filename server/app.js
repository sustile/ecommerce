const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fs = require("fs");
// const ExpressPeerServer = require("peer").ExpressPeerServer;
const { createServer } = require("http");
// const io = require("./socketConnections");
const chokidar = require("chokidar");

const { verify, verifyDisable } = require("./middlewares/middleware");
const router = require("./Routers/router");
const { pathToFileURL } = require("url");
const app = express();
const cors = require("cors");

// app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: 15000000 }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../build")));
app.use(cors());
app.use("/productImages", express.static(path.join(__dirname, "../Products")));
app.use("/carouselImages", express.static(path.join(__dirname, "../Carousel")));
app.use("/bannerImages", express.static(path.join(__dirname, "../Banner")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.status(200).redirect("/home");
});

app.get("/shop", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/home", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/product", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/account", verify, (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

// app.get("/account", (req, res) => {
//   res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
// });

app.get("/cart", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/checkout", verify, (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/register", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/login", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../build/index.html"));
});

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 1,
  });
  res.redirect("/login");
});

app.use("/", router);

const server = createServer(app);

server.listen(4000, "0.0.0.0", () => {
  console.log("Server Started on Port 4000");
});
