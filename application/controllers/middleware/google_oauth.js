/*
passport setup
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

Solution:
  When the User logs in with OAuth they are a

Reference:
  https://www.youtube.com/watch?v=o9e3ex-axzA&t=629s

  OAuth (Passport.js) Tutorial #15 - Serializing Users
    https://www.youtube.com/watch?v=-PuMp5tQ8Jw
*/
// Debug printer
const debugPrinter = require("../helpers/debug/debug_printer");
const keys = require("../../config/GOOGLE_STRATEGY");

// notivize
const Email = require("../helpers/email/notifyCreate");

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("../../models/Users");

// const User = require("../../models/Users");
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

// Step 3
passport.serializeUser(function (profile, done) {
  debugPrinter.printMiddleware(`passport.serializeUser`);

  /*
  Get the user Id from the profile

  Example:
    "id":"103501661427844966339"
  */

  user_goolge_id = profile.id;

  // Put user_goolge_id in a cookie to user
  done(null, user_goolge_id);
});

// Step 4

passport.deserializeUser(async function (user_goolge_id, done) {
  debugPrinter.printMiddleware(`passport.deserializeUser`);

  /* 
   Get user_goolge_id from cookie

   Reference:
    OAuth (Passport.js) Tutorial #16 - Cookie Session
      https://www.youtube.com/watch?v=5dQsR9Kcnzc
  */

  let response = await User.getGoogleId(user_goolge_id);

  // If user exists given user_goolge_id
  if (response) {
    debugPrinter.printSuccess(`User found with Google ID: ${user_goolge_id}`);

    // *** THIS WILL ATTACH THE User object (response) TO req ***
    done(null, response);
  }
  // If user does not exist given user_goolge_id
  else {
    debugPrinter.printError(`User not found with Google ID: ${user_goolge_id}`);
    done(null, null);
  }
});

// Step 2
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: keys.google.callbackURL,
    },

    // Once the use is logged in after the top is executed they go here
    async function (accessToken, refreshToken, profile, done) {
      debugPrinter.printSuccess(`User found with Google ID: ${profile.id} from OAuth`);
      debugPrinter.printMiddleware(`passport.use`);

      // debugPrinter.printDebug("JOSEPH LOOK Profile");
      debugPrinter.printMiddleware(profile);

      // debugPrinter.printDebug("Access Token");
      // debugPrinter.printMiddleware(accessToken);
      // debugPrinter.printDebug("Refresh Token");
      // debugPrinter.printMiddleware(JSON.stringify(refreshToken));

      /*
        VIA:
          http://localhost:3000/auth/google/

        EXAMPLE:
            {
              id: '108350711533813966330',
              displayName: 'Joseph Edradan',
              name: { familyName: 'Edradan', givenName: 'Joseph' },
              emails: [ { value: 'edradanjoseph@gmail.com', verified: true } ],
              photos: [
                {
                  value: 'https://lh3.googleusercontent.com/a-/AOh14Gjr6hnHH2YEchjL2o2g9TL7y9Vkizl0SSEGzjEdDA=s96-c'
                }
              ],
              provider: 'google',
              _raw: '{\n' +
                '  "sub": "108350711533813966330",\n' +
                '  "name": "Joseph Edradan",\n' +
                '  "given_name": "Joseph",\n' +
                '  "family_name": "Edradan",\n' +
                '  "picture": "https://lh3.googleusercontent.com/a-/AOh14Gjr6hnHH2YEchjL2o2g9TL7y9Vkizl0SSEGzjEdDA\\u003ds96-c",\n' +
                '  "email": "edradanjoseph@gmail.com",\n' +
                '  "email_verified": true,\n' +
                '  "locale": "en"\n' +
                '}',
              _json: {
                sub: '108350711533813966330',
                name: 'Joseph Edradan',
                given_name: 'Joseph',
                family_name: 'Edradan',
                picture: 'https://lh3.googleusercontent.com/a-/AOh14Gjr6hnHH2YEchjL2o2g9TL7y9Vkizl0SSEGzjEdDA=s96-c',
                email: 'edradanjoseph@gmail.com',
                email_verified: true,
                locale: 'en'
              }
            }
      
        1. CHECK IF 


      */
      // Use the profile info (mainly profile id) to check if the user is regitered in your database
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   debugPrinter.printDebug(user);
      //   return done(err, user);
      // });

      //   done(err, user);
      // });
      /*
          Operation:
            If User.id in DB (Use custom Google Auth Login model)
              return done(null, profile);
            
            Else if User.id NOT in DB
              Add user to DB (Use custom Google Auth Register model)  
              return done(null, profile);
      */

      let response = await User.getGoogleId(profile.id);

      // If user exists based on profile.id
      if (response) {
        debugPrinter.printDebug(`User exists given Google ID: ${profile.id}`);

        // User ID exists, do nothing to db
        return done(null, profile);
      }
      // If user does not exists based on profile.id
      else {
        debugPrinter.printDebug(`User does not exist given Google ID: ${profile.id}`);

        /*
        The Below should mimic router.post("/register",
        */

        username = profile.displayName;
        name = profile.name.givenName;
        password = profile.id;
        active = 0;
        usertype = 0;
        email = profile.emails[0].value;
        google_id = profile.id;

        debugPrinter.printDebug([username, name, password, active, usertype, email, google_id]);

        let emailExist = await User.emailExists(email);

        if (emailExist) {
          debugPrinter.printError(`Google ID: ${google_id}'s email already exists`);
          // Return nothing
          return done(null, null);
        }

        // Communicate with the Users model to create the user
        let response = await User.createWithGoogleID(username, name, password, active, usertype, email, google_id);

        // debugPrinter.printDebug(response);

        // debugPrinter.printDebug(`User${response ? "" : " not"} created`);

        // If account could be created
        if (response && response.length) {
          debugPrinter.printSuccess(`User: ${username} was created for Goolge ID: ${google_id})`);

          // Get username
          let user_id = User.getId(username);

          // Notify user via email
          try {
            await Email.notifyCreate(email, username, user_id);
          } catch (err) {
            debugPrinter.printError(err);
          }
          // ALternatively you can return response
          return done(null, profile);

          // let userid = await User.getId(username);

          // res.locals.logged = true;
          // req.session.username = await username;
          // req.session.userid = await userid;

          // debugPrinter.printSuccess("User is not logged in, now redircting to User page");

          // res.redirect(`/user/${req.session.username}`);
        } else {
          debugPrinter.printError(`User: ${username} was not able to be created given Google ID: ${google_id}`);
          return done(null, null);
          // res.redirect("/register");
        }
      }
    }
  )
);
