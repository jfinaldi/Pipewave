var express = require("express");
var router = express.Router();
// const { body, validationResult } = require("express-validator");
var mytools = require("../helpers/mytools");
const Engine = require("../../models/Engine");
const Review = require("../../models/Review");
const User = require("../../models/Users");

// Debug printer
const debugPrinter = require("../helpers/debug/debug_printer");

// Get Home
router.get("/", async (req, res, next) => {
  if (req.query.search) {
    if (!(await mytools.isLetter(req.query.search))) {
      // OUTPUT ERROR to front end
      res.redirect("/");
    } else {
      await search(req, res, req.query.search);
    }
  } else {
    if (req.query.gender || req.query.ethnicity || req.query.major) {
      console.log(req.query);
      data = { gender: req.query.gender, ethnicity: req.query.ethnicity, major: req.query.major };
      await advancedSearch(req, res, data);
    }
    debugPrinter.printRouter("Get: /");
    console.log(req.session)
    console.log(res.locals)
    // console.log(req);
    res.render("index", {
      data: mytools.resFormatDateCreated(await Engine.getAllPosts()),
      js: true,
      home: "active",
      unique: "Home",
      search: true,
      user: req.session.username,
      hasNewAlerts: req.session.hasNewAlerts,
      usertype: req.session.usertype,
      render_js_files: ["home", "advancedFilter"],
    });
  }
});

router.get("/api/getposts/:id", async (req, res) => {
  let { id } = req.params;
  let args = id.split(",");
  res.send(await mytools.resFormatDateCreated(await Engine.getPostsApiEndpoint(parseInt(args[0]), args[1], args[2])));
});

// Get login page
router.get("/login", (req, res, next) => {
  debugPrinter.printRouter("Get: /login");
  if (req.session.username) {
    res.redirect("/");
  } else {
    res.render("login", {
      login: "active",
      unique: "Login",
    });
  }
});

// // Get Profile
// router.get("/profile", async (req, res) => {
//   debugPrinter.printRouter("Get: /profile");
//   res.render("user", {
//     unique: "User",
//     search: true,
//     hasNewAlerts: req.session.hasNewAlerts,
//     user: { username: req.session.username },
//     usertype: req.session.usertype,
//   });
// });

// Get Register
router.get("/register", (req, res, next) => {
  debugPrinter.printRouter("Get: /register");

  // If user is logged in
  if (req.session.username) {
    debugPrinter.printWarning("User is already logged in!");

    res.redirect("/");
  }
  // If not logged in
  else {
    res.render("register", {
      register: "active",
      unique: "Registration",
      render_js_files: ["register"],
    });
  }
});

// Get Alerts
router.get("/alerts", async (req, res) => {
  console.log(req.query);
  // if user is not an industry user, redirect back to homepage
  if (req.session.usertype != 2){
    res.redirect("/");
  }
  if (req.query.search) await search(req, res, req.query.search);
  if (req.query.gender || req.query.ethnicity || req.query.major) {
    console.log(req.query);
    data = { gender: req.query.gender, ethnicity: req.query.ethnicity, major: req.query.major };
    await advancedSearch(req, res, data);
  }
  debugPrinter.printRouter("Get: /alerts");
  let alerts = await User.getAlerts(req.session.userid);
  console.log(alerts);
  req.session.hasNewAlerts = false;
  res.render("alerts", {
    data: await Engine.filterSearch(alerts, req.session.lastLogin),
    js: true,
    home: "active",
    alerts: alerts,
    unique: "Home",
    search: true,
    user: req.session.username,
    hasNewAlerts: req.session.hasNewAlerts,
    usertype: req.session.usertype,
    render_js_files: ["home", "advancedFilter"],
  });
});

// Test Page for Upload -> Get Upload
router.get("/upload", (req, res, next) => {
  debugPrinter.printRouter("Get: /upload");
  res.render("upload", {
    upload: "active",
    unique: "Upload",
    search: true,
  });
});

// Get post id
router.get("/post/:id(\\d+)", async (req, res, next) => {
  debugPrinter.printRouter("Get: /post/" + req.params.id);
  try {
    let r = await Engine.getPost(req.params.id);

    // If post does exist!
    if (r && r.length) {
      res.render("post", {
        data: r[0],
        comment: await Review.getReviews(req.params.id),
        unique: "Post",
        hasNewAlerts: req.session.hasAlerts,
        usertype: req.session.usertype,
        render_js_files: ["comment"],
      });
      req.session.viewing = req.params.id;
      console.log(req.session);
    }
    // If post does not exist
    else {
      debugPrinter.printWarning("/post/" + req.params.id + " does not exist!");
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
});

// Get resume id
router.get("/resume/:id(\\d+)", async (req, res, next) => {
  debugPrinter.printRouter("Get: /resume/" + req.params.id);
  console.log(req.session)

  let resume = await Engine.getRES(req.params.id);
  console.log(resume);

  res.render("resume", {
    //data: await resp[0],
    data: resume,
    unique: "Post",
    search: true,
    hasNewAlerts: req.session.hasAlerts,
    usertype: req.session.usertype,
    user: { username: req.session.username },
    userid: req.params.id, //userid of the resume page
    userviewerid: req.session.userid,
    render_css_files: ["Post"],
    render_js_files: ["comment"],
  });
});

// Post commment
router.post("/comment", async (req, res, next) => {
  debugPrinter.printRouter("Get: /comment/");

  // If user use not logged in
  if (!req.session.username) {
    debugPrinter.printWarning("User not logged in. Cannot Comment!");
    res.redirect("/comment");
  }

  // If user is logged in
  else {
    if (req.session.usertype) {
      let comment = req.body.comment;
      debugPrinter.printDebug("User Comment:");
      debugPrinter.printDebug(comment);
      await Review.addReview(comment, req.session.viewing, req.session.userid);
      // res.render("/post/" + res.locals.viewing)
      // successPrint(`User: ${req.session.userid}\nReview Left: ${comment}\nPost ID: ${req.session.viewing}`);
      res.redirect("/post/" + req.session.viewing);
    } 
    else {
      debugPrinter.printWarning("Students are not allowed to leave reviews");
    }
  }
});

// Post search
const search = async (req, res, search) => {
  // console.log(search);
  debugPrinter.printRouter("Get: /search");

  if (!search) {
    debugPrinter.printDebug(`Search is empty!`);
    res.render("index", {
      data: await mytools.resFormatDateCreated(await Engine.advancedSearch(10)),
      js: true,
      home: "active",
      unique: "Home",
      search: true,
      render_js_files: ["home", "advancedFilter"],
    });
  }
  // Search given
  else {
    debugPrinter.printDebug(`Search: ${search}`);

    res.render("index", {
      data: await mytools.resFormatDateCreated(await Engine.search(search)),
      js: true,
      home: "active",
      unique: "Home",
      search: true,
      render_js_files: ["home", "advancedFilter"],
    });
  }
};

const advancedSearch = async (req, res, search) => {
  debugPrinter.printRouter("Get: Advanced Search");
  debugPrinter.printRouter(search);

  if (!search) {
    debugPrinter.printDebug(`Search is empty!`);
    res.render("index", {
      data: await mytools.resFormatDateCreated(await Engine.getallPosts()),
      js: true,
      home: "active",
      unique: "Home",
      search: true,
      render_js_files: ["home", "advancedFilter"],
    });
  }

  // Search given
  else {
    debugPrinter.printDebug(`Search: ${JSON.stringify(search)}`);
    // search = search.filter(x => x != null);
    //
    let testing = await Engine.advancedSearch(search);
    debugPrinter.printDebug("Output");

    debugPrinter.printDebug(testing);

    res.render("index", {
      data: testing,
      js: true,
      home: "active",
      unique: "Home",
      search: true,
      render_js_files: ["home", "advancedFilter"],
    });
  }
};

// router.get("/*", (req, res) => {
//   res.render("error", {
//     unique: "error",
//   });
// });

module.exports = router;
