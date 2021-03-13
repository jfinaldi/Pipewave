var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var handlebars = require("express-handlebars");
var indexRouter = require("./controllers/routes/index");
var authRouter = require("./controllers/routes/auth");

var userRouter = require("./controllers/routes/users");
var aboutRouter = require("./controllers/routes/about");
var sessions = require("express-session");
const MySQLStore = require("express-mysql-session");
const passport = require("passport");
var mysqlSession = require("express-mysql-session")(sessions);
require("./controllers/middleware/google_oauth");
// const upload = require("express-fileupload");

var app = express();
app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/layouts/partials"),
    extname: ".hbs",
    defaultLayout: "home",
    helpers: {
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3) {
          console.log("ERROR");
          throw new Error("Handlebars Helper equal needs 2 parameters");
        }
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.get("/success", (req, res) => {
  res.send(`Successfully logged in ${req.user.email}`);
});

var mysqlSessionsStore = new mysqlSession({}, require("./config/database"));
app.use(
  sessions({
    key: "qwerty",
    secret: "jkdslk29asjl2",
    store: mysqlSessionsStore,
    resave: false,
    saveUninitialized: false,
  })
);

/*
Passport initialization
  http://www.passportjs.org/docs/configure/
    "Note that enabling session support is entirely optional, though it is recommended for most applications. 
    If enabled, be sure to use session() before passport.session() to ensure that the login session is restored in the correct order."
*/
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "hbs");
// app.use(upload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
  let a = req.url.split("/");
  res.locals.authpage = false;
  if (req.session.username) {
    console.log("username: ", req.session.username);
    res.locals.logged = true;
    res.locals.username = req.session.username;
    if (res.locals.username == a[a.length - 1]) res.locals.authpage = true;
  }
  next();
});

// Password and OAuth
app.use("/auth", authRouter);
app.use("/", indexRouter);
app.use("/about", aboutRouter);
app.use("/users", userRouter);

// app.use((err, req, res, next) => {
//   res.render("error", { err_message: err });
// });

module.exports = app;
