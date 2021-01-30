var express = require("express");
var router = express.Router();
// var db = require("../config/database");
// const { body, validationResult } = require("express-validator");
var mytools = require("../helpers/mytools");
const Engine = require("../../models/Engine");
const session = require("express-session");

router.get("/", async (req, res) => {
  res.render("index", {
    data: mytools.convert(await Engine.getPosts(10)),
    js: true,
    home: "active",
    unique: "Home",
    search: true,
    user: req.session.username,
  });
});

router.get("/login", (req, res, next) => {
  if (req.session.username) {
    console.log("asd");
    res.redirect("/");
  } else {
    res.render("login", {
      login: "active",
      unique: "Login",
    });
  }
});
router.get("/profile", async (req, res) => {
  res.render("user", {
    unique: "User",
    search: true,
    user: { username: req.session.username },
  });
});
router.get("/register", (req, res, next) => {
  if (req.session.username) {
    console.log("asd");
    res.redirect("/");
  } else {
    console.log("asasdd");
    res.render("register", {
      register: "active",
      unique: "Registration",
    });
  }
});

router.get("/upload", (req, res, next) => {
  res.render("upload", {
    upload: "active",
    unique: "Upload",
    search: true,
  });
});

router.get("/post/:id(\\d+)", async (req, res, next) => {
  try {
    let r = mytools.convert(await Engine.getPost(req.params.id));
    if (r && r.length) {
      res.render("post", { data: r[0], unique: "post" });
      req.session.viewing = req.params.id;
    } else {
      console.log("here");
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/search", async (req, res) => {
  // console.log(validationResult(req));
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  // res.redirect("/");
  // }
  if (!req.body.search) {
    res.send({
      resultStatus: "info",
      message: "No search term given",
      results: [],
    });
  } else {
    res.render("index", {
      data: await Engine.search(req.body.search),
      js: true,
      home: "active",
      unique: "Home",
      search: true,
    });
  }
});

// router.get("/*", (req, res) => {
//   res.render("error", {
//     unique: "error",
//   });
// });

module.exports = router;
