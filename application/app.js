var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var handlebars = require("express-handlebars");
var indexRouter = require("./controllers/routes/index");
var userRouter = require("./controllers/routes/users");
var aboutRouter = require("./controllers/routes/about");

var sessions = require("express-session");
const MySQLStore = require("express-mysql-session");
var mysqlSession = require("express-mysql-session")(sessions);
const upload = require("express-fileupload");

var app = express();
app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/layouts/partials"),
    extname: ".hbs",
    defaultLayout: "home",
    helpers: {},
  })
);

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

app.set("view engine", "hbs");
app.use(upload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
  if (req.session.username) {
    res.locals.logged = true;
  }
  next();
});

app.use("/", indexRouter);
app.use("/about", aboutRouter);
app.use("/users", userRouter);

// app.use((err, req, res, next) => {
//   res.render("error", { err_message: err });
// });

module.exports = app;