var db = require("../config/database");
const pdfReader = require("../controllers/helpers/pdf_handler");
const debugPrinter = require("../controllers/helpers/debug/debug_printer");

const Engine = {};

//grabs n amount of posts from db and returns the data
Engine.getPosts = async limit => {
  debugPrinter.printFunction("Engine.getPosts");
  let baseSQL =
    "SELECT u.username,u.name,  p.id, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY created DESC LIMIT ?";
  let [r, fields] = await db.query(baseSQL, [limit]);
  return r;
};

Engine.getPostsApiEndpoint = async (limit, filter, order = "DESC") => {
  //filter = created, reviews
  //ASC - DESC
  debugPrinter.printFunction("Engine.getPosts");
  debugPrinter.printDebug([limit, filter, order]);
  let baseSQL =
    "SELECT u.username,u.name,  p.id, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY ? ? LIMIT ?";
  let [r, fields] = await db.query(baseSQL, [filter, order, limit]);
  return r;
};

Engine.search = async search => {
  debugPrinter.printFunction("Engine.search");
  try {
    let baseSQL =
      "SELECT p.id, p.title, p.description, p.created, u.username, u.name, concat_ws(' ', p.title, p.description, p.tags) AS haystack FROM users u JOIN posts p ON u.id=fk_userid HAVING haystack like ?;";
    let sqlready = "%" + search + "%";
    let [r, fields] = await db.execute(baseSQL, [sqlready]);
    return r && r.length ? r : await Engine.getPosts(10);
  } catch (err) {
    return false;
  }
};

Engine.getPost = async id => {
  debugPrinter.printFunction("Engine.getPost");
  try {
    var baseSQL =
      "SELECT p.id as postid, p.role, u.id,u.email, u.name, u.username, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid WHERE p.id=?;";
    let [r, fields] = await db.query(baseSQL, [id]);
    return r;
  } catch (err) {
    debugPrinter.printWarning(`Post id: ${id} does not exist in the DB`);
    return null;
  }
};

// Get all posts from 1 User
Engine.getUserPosts = async username => {
  debugPrinter.printFunction("Engine.getUserPosts");
  try {
    var baseSQL =
      "SELECT p.id as postid, p.role, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid WHERE u.username=?";
    let [r, fields] = await db.query(baseSQL, [username]);
    return r;
  } catch (err) {
    debugPrinter.printWarning(`Username: ${username} does not exist in the DB`);
    return null;
  }
};

Engine.setPost = async (title, description, file, fk_userid) => {
  debugPrinter.printFunction("Engine.setPost");
  try {
    console.log(fk_userid);
    let path = "/assets/" + file.filename;
    let tags = await pdfReader("./public" + path);
    debugPrinter.printDebug(tags);
    // let path = "/assets/" + req.file.filename;
    var baseSQL = "INSERT INTO `website`.`posts`(`title`,`description`,`resumepath`,`created`, `tags`, `fk_userid`) VALUES(?,?,? ,now(), ?,?);";
    let [r, fields] = await db.query(baseSQL, [title, description, path, tags, fk_userid]);
    debugPrinter.printDebug("Response", r);
    return r;
  } catch (err) {
    console.log("Couldnt Create Post");
    return null;
  }
};

module.exports = Engine;
