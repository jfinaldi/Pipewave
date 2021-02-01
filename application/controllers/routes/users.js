var express = require("express");
var router = express.Router();
const { successPrint, errorPrint } = require("../helpers/printers");
const User = require("../../models/Users");
const Engine = require("../../models/Engine");
var mytools = require("../helpers/mytools");

router.post("/login", async (req, res, next) => {
  if (req.session.username) {
    res.redirect("/");
  } else {
    var { username, password } = req.body;
    let [auth, userid] = await User.authenticate(username, password);
    if (auth) {
      res.locals.logged = true;
      req.session.username = await username;
      req.session.userid = await userid;
      console.log(username, "has logged in");
      res.redirect("/");
    } else {
      console.log("Incorrect Login");
      res.redirect("../login");
    }
  }
});

router.post("/register", async (req, res, next) => {
  if (req.session.username) {
    res.redirect("/");
  } else {
    let { username, name, email, password } = req.body,
      active = 0,
      usertype = 0;
    console.log("test");
    let a = await User.create(
      username,
      name,
      password,
      active,
      usertype,
      email
    );
    console.log(`user${a ? "" : " not"} created`);
    res.redirect(a ? "/login" : "/register");
  }
});

router.post("/logout", async (req, res) => {
  if (!req.session.username) {
    res.redirect("/");
  } else {
    successPrint("before");

    req.session.destroy(async err => {
      if (err) {
        errorPrint("Session could not be destroyed");
      } else {
        successPrint("Session was destroyed");
        res.clearCookie("qwerty");
        res.redirect("/");
      }
    });
    successPrint("after");
  }
});

router.post("/upload", async (req, res, next) => {
  if (!req.session.username) {
    res.redirect("/");
  } else {
    let { title, description } = req.body;
    if (req.files) {
      //
    }
  }
});

router.post("/changeUsername", async (req, res) => {
  let status;
  if (!res.locals.logged) {
    status = "User not logged in";
    res.render("user", {
      unique: "user",
      search: true,
      user: { username: req.session.username, status: status },
    });
  } else {
    let { new_username, confirm_password } = req.body;
    await User.changeUser(new_username, confirm_password, req.session.userid);
    req.session.username = new_username;
    status = "Username Updated";
    res.render("user", {
      unique: "user",
      search: true,
      user: { username: req.session.username, status: status },
    });
  }
});

router.post("/changePassword", async (req, res) => {
  let { old_password, new_password } = req.body;
  let status;

  let response = await User.changePassword(
    req.session.username,
    old_password,
    new_password,
    req.session.userid
  );

  if (response.changedRows) {
    console.log("updated");
    console.log(response);
    status = "Password Updated";
    res.render("user", {
      unique: "user",
      search: true,
      user: { username: req.session.username, status: status },
    });
  } else {
    status = "Server Error, please try again later";
    res.render("user", {
      unique: "user",
      search: true,
      user: { username: req.session.username, status: status },
    });
  }
});

router.post("/changeEmail", async (req, res) => {
  let { old_password, new_email } = req.body;
  let status;
  let response = await User.changeEmail(
    old_password,
    new_email,
    req.session.userid
  );
  console.log("updated");
  console.log(response);
  status = `Email Changed to ${new_email}`;
  res.render("user", {
    unique: "user",
    user: { username: req.session.username, status: status },
  });
});
router.get("/:user", async (req, res) => {
  let r = await mytools.convert(await Engine.getUserPosts(req.params.user));
  successPrint(r[0]);
  res.render("user", {
    user: await mytools.convert(await User.getInfo(req.params.user))[0],
    post: r[0],
    unique: "User",
  });
});
module.exports = router;
