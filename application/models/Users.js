var db = require("../config/database");
var bcrypt = require("bcrypt");
const debugPrinter = require("../controllers/helpers/debug/debug_printer");

const User = {};

User.emailExists = async email => {
  debugPrinter.printFunction("User.emailExists");
  try {
    let [r, fields] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
    return r && r.length;
  } catch (err) {
    return false;
  }
};

User.usernameExists = async user => {
  debugPrinter.printFunction("User.usernameExists");

  try {
    let [r, fields] = await db.execute("SELECT * FROM users WHERE username=?", [user]);
    return r && r.length;
  } catch (err) {
    return false;
  }
};

User.create = async (username, name, password, active, usertype, email, title) => {
  debugPrinter.printFunction("User.create");

  password = await bcrypt.hash(password, 15);
  if (!((await User.emailExists(email)) && (await User.usernameExists(username)))) {
    let baseSQL = "INSERT INTO users (`username`,`name`, `email`, `active`,`usertype`, `password`, `created`, `title`) VALUES (?,?,?,?,?,?, now(), ?);";
    let a = await db.execute(baseSQL, [username, name, email, active, usertype, password, title]);
    return a;
  }
};
User.createWithGoogleID = async (username, name, password, active, usertype, email, googleid) => {
  debugPrinter.printFunction("User.createWithGoogleID");

  password = await bcrypt.hash(password, 15);
  if (!((await User.emailExists(email)) && (await User.usernameExists(username)))) {
    let baseSQL = "INSERT INTO users (`username`,`name`, `email`, `active`,`usertype`, `created`, `password`, googleid) VALUES (?,?,?,?,?, now(), ?, ?);";
    let a = await db.execute(baseSQL, [username, name, email, active, usertype, password, googleid]);
    return a;
  }
};

User.getId = async username => {
  debugPrinter.printFunction("User.getId");

  let baseSQL = "SELECT id FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  if (r && r.length) {
    return r[0].id;
  } else {
    console.log("error retrieving id");
    return null;
  }
};

User.getUsername = async id => {
  debugPrinter.printFunction("User.getUsername");

  let baseSQL = "SELECT username FROM users WHERE id=?;";
  let [r, fields] = await db.execute(baseSQL, [id]);
  if (r && r.length) {
    return r[0].username;
  } else {
    console.log("error retrieving id");
    return null;
  }
};

// From google ID get user IO
User.getGoogleId = async googleid => {
  debugPrinter.printFunction("User.getGoogleId");

  let baseSQL = "SELECT id FROM users WHERE googleid=?;";
  let [r, fields] = await db.execute(baseSQL, [googleid]);
  if (r && r.length) {
    return r[0].id;
  } else {
    debugPrinter.printWarning(`Google ID: ${googleid} is not in the DB`);
    return null;
  }
};

User.authenticate = async (username, password) => {
  debugPrinter.printFunction("User.authenticate");

  let baseSQL = "SELECT id,username, password FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);

  // If user stuff exists based on Username
  if (r && r.length) {
    let check = await bcrypt.compare(password, r[0].password);
    let userid = r[0].id;

    // If password is in the DB
    if (check) return [true, userid];
    else return [false, null];
  }

  // Username does not exist
  else {
    debugPrinter.printWarning(`Username: ${username} is not in the DB`);
    return [false, null];
  }
};

User.checkPassword = async (username, password) => {
  debugPrinter.printFunction("User.checkPassword");

  let baseSQL = "SELECT id,username, password FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);

  return r && r.length ? ((await bcrypt.compare(password, r[0].password)) ? true : false) : false;
};

User.checkUser = async username => {
  debugPrinter.printFunction("User.checkUser");

  let baseSQL = "SELECT username FROM users WHERE `username`=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  //true exists : false doesnt exist
  return r && r.length ? true : false;
};

User.changePassword = async (username, confirm_password, new_password, userid) => {
  debugPrinter.printFunction("User.changePassword");

  if (await User.checkPassword(username, confirm_password)) {
    let baseSQL = "UPDATE `users` SET `password` = ? WHERE `id` = ?;";
    new_password = await bcrypt.hash(new_password, 15);
    let [r, fields] = await db.execute(baseSQL, [new_password, userid]);
    return r;
  } else return null;
};

User.changeEmail = async (username, confirm_password, new_email, userid) => {
  debugPrinter.printFunction("User.changeEmail");

  if (await User.checkPassword(username, confirm_password)) {
    let baseSQL = "UPDATE `users` SET `email` = ? WHERE `id` = ?;";
    let [r, fields] = await db.execute(baseSQL, [new_email, userid]);
    return r;
  } else return null;
};

User.changeUser = async (username, confirm_password, userid) => {
  debugPrinter.printFunction("User.changeUser");

  if (await User.checkPassword(username, confirm_password)) {
    if (!(await User.checkUser(username))) {
      let baseSQL = "UPDATE `users` SET `email` = ? WHERE `id` = ?;";
      let [r, fields] = await db.execute(baseSQL, [new_email, userid]);
      return r;
    } else return null;
  } else return null;
};

User.getInfo = async username => {
  debugPrinter.printFunction("User.getInfo");

  var baseSQL = "SELECT bio, id, profilepic, name,email,usertype,title,created, username FROM users WHERE username=?;";
  let [r, fields] = await db.query(baseSQL, [username]);
  return r;
};

const handler = async value => {
  try {
    return await value.split();
  } catch (err) {
    return await value;
  }
};

User.getAlerts = async user_id => {
  debugPrinter.printFunction("User.getAlerts");

  var baseSQL = "SELECT ethnicity, major, gender FROM alerts WHERE fk_userid=?;";
  let [r, fields] = await db.query(baseSQL, [user_id]);
  if (r && r.length) {
    r[0].ethnicity = await handler(r[0].ethnicity);
    r[0].major = await handler(r[0].major);
    r[0].gender = await handler(r[0].gender);
    return r;
  }
  return false;
};

User.hasAlerts = async user_id => {
  let basesql = "SELECT id FROM alerts WHERE fk_userid=?;";
  let [r, fields] = await db.query(baseSQL, [user_id]);
  return r && r.length;
};
const alertsetter = async option => {
  if (option == NULL || option == undefined) return NULL;
};

User.setAlert = async (object, userid) => {
  console.log(object[0]);

  if (User.hasAlerts(userid)) basesql = "UPDATE `website`.`alerts` SET `ethnicity` = ?, `major` = ?, `gender` = ? WHERE `fk_userid` = ?;";
  else basesql = "INSERT INTO `website`.`alerts` SET `ethnicity` = ?, `major` = ?, `gender` = ?, `fk_userid` = ?;";
  db.query(basesql, [object.ethnicity, object.major, object.gender, userid]);
};
module.exports = User;
