/*
Notes:
  Use express sessions than cookie session

  Moved to app
  router.use(passport.initialize());
  router.use(passport.session());

  We use express sessions

  1. Send uses to Google then Call Use passport.authenticate
      File: auth.js
      Operation:
        Asks the user to login via google account

    
  2. passport.use GET STUFF FROM GOOGLE
      File: google_oauth.js
      Operation:
        Gets the info of the Google User once the User has logged in
        (We care about Display name, id, email)
    
  3. passport.serializeUser and take the id from it
      File: google_oauth.js
      Operation:
        Receives ONLY THE NECCESSARY INFO FROM THE USER (Display name, id, email)
        Return (Display name, id, email)

  4. passport.deserializeUser CHECK IN MODEL (FIND USER BY ID)
      File: google_oauth.js
      Operation:
        Receives: User (Display name, id, email)

        If User.id in DB (Use custom Google Auth Login model)
          login User

        Else if User.id NOT in DB
          Add user to DB (Use custom Google Auth Register model)  
          login User

  5. router.get("/google/callback"
      File: auth.js
      Operation:
        REDIRECT USER TO USER'S PROFILE PAGE

Reference:
  Express (NodeJS) - Google oAuth 2.0 (passportJS)
    https://www.youtube.com/watch?v=o9e3ex-axzA&t=629s
*/
var express = require("express");
var router = express.Router();
const passport = require("passport");
const debugPrinter = require("../helpers/debug/debug_printer");
const User = require("../../models/Users");

// Step 1
router.get(
  "/google",
  // Uing Google strategy
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

// Step 5
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), async function (req, res) {
  debugPrinter.printRouter("Get: /google/callback");

  // debugPrinter.printSuccess(req.session.passport.user);

  let userid = await User.getGoogleId(req.session.passport.user);
  res.locals.logged = true;
  req.session.username = await User.getUsername(userid);
  req.session.userid = await userid;

  // User was successfully logged in via google OAuth
  debugPrinter.printSuccess(`User: ${req.session.username} was successfully logged in via google OAuth`);

  res.redirect("/");
});

module.exports = router;
