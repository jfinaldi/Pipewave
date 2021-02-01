var db = require("../config/database");
var bcrypt = require("bcrypt");

const User = {};

User.emailExists = async email => {
  try {
    let [r, fields] = await db.execute("SELECT * FROM users WHERE email=?", [
      email,
    ]);
    return r && r.length;
  } catch (err) {
    return false;
  }
};

User.create = async (
  username,
  name,
  password,
  active,
  usertype,
  email,
  major
) => {
  password = await bcrypt.hash(password, 15);
  if (
    !((await User.emailExists(email)) && (await User.usernameExists(username)))
  ) {
    let baseSQL =
      "INSERT INTO users (`username`,`name`, `email`,`title`, `active`,`usertype`, `password`, `created`) VALUES (?,?,?,?,?,?,?, now());";
    let a = await db.execute(baseSQL, [
      username,
      name,
      email,
      major,
      active,
      usertype,
      password,
    ]);
    return a;
  }
};
User.getId = async username => {
  let baseSQL = "SELECT id FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  if (r && r.length) {
    return r[0].id;
  } else {
    console.log("error retrieving id");
    return null;
  }
};
User.authenticate = async (username, password) => {
  let baseSQL = "SELECT id,username, password FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  if (r && r.length) {
    let check = await bcrypt.compare(password, r[0].password);
    let userid = r[0].id;

    if (check) return [true, userid];
    else return [false, null];
  } else {
    console.log("error logging in");
    return [false, null];
  }
};

User.checkPassword = async (username, password) => {
  let baseSQL = "SELECT id,username, password FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);

  return r && r.length
    ? (await bcrypt.compare(password, r[0].password))
      ? true
      : false
    : false;
};

User.checkUser = async username => {
  let baseSQL = "SELECT username FROM users WHERE `username`=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  //true exists : false doesnt exist
  return r && r.length ? true : false;
};

User.changePassword = async (
  username,
  confirm_password,
  new_password,
  userid
) => {
  if (await User.checkPassword(username, confirm_password)) {
    let baseSQL = "UPDATE `users` SET `password` = ? WHERE `id` = ?;";
    new_password = await bcrypt.hash(new_password, 15);
    let [r, fields] = await db.execute(baseSQL, [new_password, userid]);
    return r;
  } else return null;
};

User.changeEmail = async (username, confirm_password, new_email, userid) => {
  if (await User.checkPassword(username, confirm_password)) {
    let baseSQL = "UPDATE `users` SET `email` = ? WHERE `id` = ?;";
    let [r, fields] = await db.execute(baseSQL, [new_email, userid]);
    return r;
  } else return null;
};

User.changeUser = async (username, confirm_password, userid) => {
  if (await User.checkPassword(username, confirm_password)) {
    if (!(await User.checkUser(username))) {
      let baseSQL = "UPDATE `users` SET `email` = ? WHERE `id` = ?;";
      let [r, fields] = await db.execute(baseSQL, [new_email, userid]);
      return r;
    } else return null;
  } else return null;
};

User.getInfo = async username => {
  var baseSQL =
    "SELECT bio, id, name,email,usertype,title,created, username FROM users WHERE username=?;";
  let [r, fields] = await db.query(baseSQL, [username]);
  return r;
};
module.exports = User;
