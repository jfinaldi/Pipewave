var express = require("express");
var router = express.Router();
const { successPrint, errorPrint } = require("../helpers/printers");
const User = require("../../models/Users");
const Engine = require("../../models/Engine");
var mytools = require("../helpers/mytools");
var mytools = require("../helpers/mytools");
const multer = require("multer");
const crypto = require("crypto");

// notivize
const Email = require("../helpers/email/notifyCreate");

// Debug printer
const debugPrinter = require("../helpers/debug/debug_printer");
const { hasAlerts } = require("../../models/Users");

// Post login
router.post("/login", async (req, res, next) => {
  debugPrinter.printRouter("Post: /login");

  // If user is logged in
  if (req.session.username) {
    debugPrinter.printWarning("User already Logged in");
    res.redirect("/");
  }

  // If not logged in
  else {
    // Get username and password
    var { username, password } = req.body;

    // Authenticate user
    let [auth, userid, usertype, lastlogin] = await User.authenticate(username, password);
    if (auth) {
      // Assign stuff to user once logged in
      res.locals.logged = true;
      req.session.hasNewAlerts = false;
      req.session.username = await username;
      req.session.userid = await userid;
      req.session.usertype = await usertype; // Kevin added

      // If this user is an industry account
      // create a hasAlerts variable in session and
      // set it to true if last login < created of some alert
      // object relevant to this account
      if(req.session.usertype === 2) {
        console.log("usertype is industry. Checking for new alerts now...");
        let lastLogin = await lastlogin;
        let newAlerts = await User.hasNewAlerts(lastLogin);
        if(newAlerts === true) {
          req.session.hasNewAlerts = true;
          console.log("We have new alerts! yay");
        } else {
          console.log("We have no new alerts boo")
          req.session.hasNewAlerts = false;
        }
        console.log(req.session.hasNewAlerts);
      }
      // } else {
      //   console.log("We have no new alerts");
      //   req.session.noNewAlerts = true;
      // }

      // update the last login to now
      await User.updateLastLogin(username);

      debugPrinter.printSuccess(username, "has logged in");
      res.redirect("/");
    } else {
      debugPrinter.printWarning("Incorrect Login");
      res.redirect("../login");
    }
  }
});

// Post Register
router.post("/register", async (req, res, next) => {
  debugPrinter.printRouter("Post: /register");

  // If user is logged in
  if (req.session.username) {
    res.redirect("/");
  }
  // If not logged in
  else {
    let { username, name, email, password, title, usertype } = req.body,
      active = 0;
    let schooltypes = ["Student", "Professor"];
    let orgtypes = ["ERG", "NPO", "Recruiter"];
    if (usertype == schooltypes[0]) usertype = 0;
    if (usertype == schooltypes[1]) usertype = 1;
    if (orgtypes.includes(usertype)) usertype = 2;

    console.log(usertype);
    // Communicate with the Users model to create the user
    let response = await User.create(username, name, password, active, usertype, email, title);
    // debugPrinter.printDebug(`User${response ? "" : " not"} created`);

    if (response) {
      debugPrinter.printSuccess(`User: ${username} was created`);
      try {
        await Email.notifyCreate(email, username, userid);
      } catch (err) {
        debugPrinter.printError(err);
      }

      let userid = await User.getId(username);
      res.locals.logged = true;
      req.session.username = await username;
      req.session.userid = await userid;
      req.session.usertype = await usertype;

      debugPrinter.printSuccess("User is logged in, now redircting to User page");

      res.redirect(`/user/${req.session.username}`);
    } else {
      debugPrinter.printError(`User: ${username} was not able to be created`);

      res.redirect("/register");
    }
  }
});

// Post Logout
// router.post("/logout", async (req, res) => {
//   debugPrinter.printRouter("Post: /logout");

//   // If not logged in
//   if (!req.session.username) {
//     debugPrinter.printWarning("User not logged in trying to log out");
//     res.redirect("/");
//   }
//   // If user is logged in
//   else {
//     debugPrinter.printSuccess(`User ${req.session.username} has logged out!`);

//     req.session.destroy(async err => {
//       // If an error has occurred during the User's session being destroyed
//       if (err) {
//         debugPrinter.printError("Session could not be destroyed!");
//       }
//       // If the User's session was destroyed
//       else {
//         debugPrinter.printSuccess("Session was destroyed!");
//         res.clearCookie("qwerty");
//         res.redirect("/");
//       }
//     });
//     debugPrinter.printSuccess("Post: /logout route was successful!");
//   }
// });

// Get Logout
router.get("/logout", async (req, res) => {
  debugPrinter.printRouter("Get: /logout");

  // If not logged in
  if (!req.session.username) {
    debugPrinter.printWarning("User not logged in trying to log out");
    res.redirect("/");
  }
  // If user is logged in
  else {
    debugPrinter.printSuccess(`User ${req.session.username} has logged out!`);

    req.session.destroy(async err => {
      // If an error has occurred during the User's session being destroyed
      if (err) {
        debugPrinter.printError("Session could not be destroyed!");
      }
      // If the User's session was destroyed
      else {
        debugPrinter.printSuccess("Session was destroyed!");
        res.clearCookie("qwerty");
        res.redirect("/");
      }
    });
    debugPrinter.printSuccess("Post: /logout route was successful!");
  }
});

const multerStorage = multer.diskStorage({
  // Add an new key called destination
  destination: (req, file, cb) => {
    // Image upload location

    let pathImageFileUploadLocation = "public/assets/resumes";

    cb(null, pathImageFileUploadLocation);
  },

  // Add a new key called filename
  filename: (req, file, cb) => {
    // Get file ext
    debugPrinter.printDebug(`file: ${file}`);

    let fileExt = file.mimetype.split("/")[1];

    // Generate file name
    let randomName = crypto.randomBytes(22).toString("hex");
    cb(null, `${randomName}.${fileExt}`);
  },
});

const uploader = multer({ storage: multerStorage });

router.post("/upload", uploader.single("photofile"), async (req, res, next) => {
  debugPrinter.printRouter("Post: /upload");
  debugPrinter.printDebug(`PATH: ${req.file.path}`);

  // let path = "/assets/" + req.file.filename;
  if (!req.session.username) {
    res.redirect("/");
  } else {
    let { title, description } = req.body;
    if (!req.file) res.redirect("/");
    // debugPrinter.printDebug(title, description, req.files.photofile.name);

    let response = await Engine.setPost(title, description, req.file, req.session.userid);
    if (response && response.length) debugPrinter.printError("Post was not Created");
    else debugPrinter.printSuccess("Post was Created");
    res.redirect("/");
  }
});

router.post("/edit_profile_picture", uploader.single("photo"), async (req, res) => {
  if (!req.session.username) {
    res.redirect("/");
  } else {
    debugPrinter.printRouter(req.file);

    await Engine.updatePFP(req.file, req.session.userid);
    res.redirect("/");
  }
});
// Post changeUsername
router.post("/changeUsername", async (req, res) => {
  debugPrinter.printRouter("Post: /changeUsername");

  let status;

  // If not logged in
  if (!res.locals.logged) {
    status = "User not logged in";
    res.render("user", {
      unique: "user",
      search: true,
      user: { username: req.session.username, status: status },
    });
  }

  // If user is logged in
  else {
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

// Post changePassword
router.post("/changePassword", async (req, res) => {
  debugPrinter.printRouter("Post: /changePassword");

  let { old_password, new_password } = req.body;
  let status;

  let response = await User.changePassword(req.session.username, old_password, new_password, req.session.userid);

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

// Post changeEmail
router.post("/changeEmail", async (req, res) => {
  debugPrinter.printRouter("Post: /changeEmail");

  console.log(req.body);
  console.log(req.body.email);

  let status;
  let response = await User.changeEmail(req.body.email, req.session.userid);
  console.log("updated");
  console.log(response);
  status = `Email Changed to ${req.body.email}`;
  res.redirect("/user/" + req.session.username + "/settings");
});

// Page user
router.get("/:user", async (req, res) => {
  debugPrinter.printRouter(`Get: /users/${req.params.user}`);
  let r = await Engine.getUserPosts(req.params.user);
  debugPrinter.printRouter(r);
  successPrint(r[0]);
  res.render("user", {
    user: await mytools.resFormatDateCreated(await User.getInfo(req.params.user))[0],
    post: r,
    unique: "User",
  });
});

// get settings page
router.get("/:user/settings", async (req, res) => {
  debugPrinter.printRouter("Get: /:settings");

  if(!req.session.username) {
    res.redirect("/");
  } else {
    res.render("settings", {
      unique: "Settings", //css link
      search: true,
      user: { username: req.session.username },
      usertype: { usertype : req.session.usertype},
      render_js_files: ["settings"],
    });
  }
});

router.post("/setAlert", async (req, res) => {
  let { ethnicity, gender, major } = req.body;
  // console.log(ethnicity.join());
  // console.log(isArray(ethnicity));
  // console.log(isArray(gender));
  // console.log(isArray(major));

  await User.setAlert({ ethnicity, gender, major }, req.session.userid);

  // res.send(ethnicity);
  res.redirect("/alerts");
});

// get post aka Reviews page
router.get("/:user/post", async (req, res) => {
  debugPrinter.printRouter("Get: /:post");
  let resp = await mytools.resFormatDateCreated(await Engine.getUserPosts(req.session.username));
  debugPrinter.printRouter(resp[0]);
  console.log(resp[0])
  res.render("post", {
    data: await resp[0],
    unique: "Post",
    search: true,
    user: { username: req.session.username },
    render_css_files: ["Post"],
    render_js_files: ["comment"],
  });
});

// post update settings
router.post("/updateSettings", async (req, res) => {
  debugPrinter.printRouter("Post: /updateSettings");

  if (!req.session.username) {
    res.redirect("/");
  } else {
    console.log(req.body);

    // change username
    if(req.body.username != '') {
      let status;
      let response = await User.changeUsername(req.body.username, req.session.userid);
      console.log("updated");
      console.log(response);
      status = `Username Changed to ${req.body.username}`;
      req.session.username = await req.body.username;
      res.locals.logged = true;
    }

    // name
    if(req.body.name != '') {
      let status;
      let response = await User.changeName(req.session.username, req.body.name, req.session.userid);
      console.log("updated");
      console.log(response);
      status = `Name Changed to ${req.body.name}`;
    }

    if(req.session.usertype == 0){
      // change user email
      if(req.body.email != '') {
        let status;
        let response = await User.changeEmail(req.body.email, req.session.userid);
        console.log("updated");
        console.log(response);
        status = `Email Changed to ${req.body.email}`;
      }

      // change ethnicity
      if(req.body.ethnicity != '') {
        let status;
        let response = await User.changeEthnicity(req.body.ethnicity, req.session.userid);
        console.log("updated");
        console.log(response);
        status = `Ethnicity Changed to ${req.body.ethnicity}`;
      }

      // change gender
      if(req.body.gender != '') {
        let status;
        let response = await User.changeGender(req.body.gender, req.session.userid);
        console.log("updated");
        console.log(response);
        status = `Gender Changed to ${req.body.gender}`;
      }

      // change major
      if(req.body.major != '') {
        let status;
        let response = await User.changeMajor(req.body.major, req.session.userid);
        console.log("updated");
        console.log(response);
        status = `Major Changed to ${req.body.major}`;
      }
    }

    if(req.session.usertype == 1){
      // change department
      if(req.body.department != '') {
        let status;
        let response = await User.changeDepartment(req.body.department, req.session.userid);
        console.log("updated");
        console.log(response);
        status = `Department Changed to ${req.body.department}`;
      }
    }
    
    if(req.session.usertype == 2){
      // change company
      if(req.body.company != '') {
        let status;
        let response = await User.changeCompany(req.body.company, req.session.userid);
        console.log("updated");
        console.log(response);
        status = `Company Changed to ${req.body.company}`;
      }
    }

    // change password
    if(req.body.password != '') {
      let status;
      let response = await User.changePassword(req.session.username, req.body.password, 
                                               req.body.confirmpassword, req.session.userid);
      console.log("updated");
      console.log(response);
      status = `Password Changed to ${req.body.password}`;
    }
    res.redirect("/user/" + req.session.username);
  }
});

// post update resume
router.post("/edit_resume", uploader.single("resume"), async (req, res) => {
  debugPrinter.printRouter("Post: /edit_resume");

  let user = req.session.username;

  if (!req.session.username) {
    res.redirect("/");
  } else {
    debugPrinter.printRouter(req.file);

    try {
      let [r, fields] = await Engine.updateRES(req.file, req.session.userid);
      res.redirect("/user/" + user + "/settings");
    } catch (err) {
      console.log("Error: could not update resume");
      console.log(err);
      res.redirect("/user/" + user + "/settings");
    }

  }
});

module.exports = router;
