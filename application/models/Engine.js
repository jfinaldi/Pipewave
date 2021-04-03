var db = require("../config/database");
const pdfReader = require("../controllers/helpers/pdf_handler");
const debugPrinter = require("../controllers/helpers/debug/debug_printer");

const Engine = {};

//grabs n amount of posts from db and returns the data
// Engine.getPosts = async limit => {
//   debugPrinter.printFunction("Engine.getPosts");
//   let baseSQL =
//     "SELECT u.username,u.name,u.profilepic,  p.id, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY created DESC LIMIT ?";
//   let [r, fields] = await db.query(baseSQL, [limit]);
//   return r;
// };

Engine.getPosts = async limit => {
  debugPrinter.printFunction("Engine.getPosts");
  let baseSQL = "SELECT * FROM website.users ORDER BY created DESC LIMIT ?;";
  let [r, fields] = await db.query(baseSQL, [limit]);
  return r;
};
Engine.getAllPosts = async _ => {
  debugPrinter.printFunction("Engine.getPosts");
  let baseSQL = "SELECT * FROM website.users ORDER BY created DESC;";
  let [r, fields] = await db.query(baseSQL);
  return r;
};
Engine.getPostsApiEndpoint = async (limit, filter, order = "DESC") => {
  //filter = created, reviews
  //ASC - DESC
  debugPrinter.printFunction("Engine.getPosts");
  debugPrinter.printDebug([limit, filter, order]);
  let baseSQL = "SELECT u.username,u.name,  p.id, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY ? ? LIMIT ?";
  let [r, fields] = await db.query(baseSQL, [filter, order, limit]);
  return r;
};

Engine.search = async search => {
  debugPrinter.printFunction("Engine.search");
  try {
    let baseSQL =
      "SELECT u.id,u.name,u.profilepic, u.title,u.created, u.username, concat_ws(' ', u.name, u.username, u.title) AS haystack FROM users u HAVING haystack like ?;";
    let sqlready = "%" + search + "%";
    let [r, fields] = await db.execute(baseSQL, [sqlready]);
    return r && r.length ? r : await Engine.getPosts(10);
  } catch (err) {
    return false;
  }
};

// Engine.search = async search => {
//   debugPrinter.printFunction("Engine.search");
//   try {
//     let baseSQL =
//       "SELECT p.id, p.title, p.description, p.created,u.profilepic, u.username, u.name, concat_ws(' ', p.title,u.name, p.description, p.tags) AS haystack FROM users u JOIN posts p ON u.id=fk_userid HAVING haystack like ?;";
//     let sqlready = "%" + search + "%";
//     let [r, fields] = await db.execute(baseSQL, [sqlready]);
//     return r && r.length ? r : await Engine.getPosts(10);
//   } catch (err) {
//     return false;
//   }
// };

Engine.getPost = async id => {
  debugPrinter.printFunction("Engine.getPost");
  try {
    var baseSQL =
      "SELECT p.id as postid, p.role, u.id,u.email, u.profilepic,u.name, u.username, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid WHERE p.id=?;";
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
      "SELECT p.id as postid, p.role, p.title, p.description, p.resumePath,u.profilepic, p.created FROM users u JOIN posts p ON u.id=fk_userid WHERE u.username=?";
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

Engine.updatePFP = async (file, fk_userid) => {
  debugPrinter.printFunction("Engine.setPost");
  try {
    console.log(fk_userid);
    let path = "/assets/" + file.filename;
    // let tags = await pdfReader("./public" + path);
    debugPrinter.printDebug(fk_userid);
    // let path = "/assets/" + req.file.filename;
    var baseSQL = "UPDATE `website`.`users` SET `profilepic` = ? WHERE `id` = ?;";
    let [r, fields] = await db.query(baseSQL, [path, fk_userid]);
    debugPrinter.printDebug("Response", r);
    return r;
  } catch (err) {
    console.log("Couldnt Create Post");
    return null;
  }
};
// SELECT u.id, u.ethnicity, u.major, u.profilepic, u.username, u.name FROM users u WHERE `gender`="male" and `major`="Computer Science" and `ethnicity`="hispanic";

const helper_cluster = (x, filter_name, count, base) => {
  if (x) {
    console.log("Gender passed in");
    base += count ? ` and ${filter_name}="${x}"` : `WHERE ${filter_name}="${x}"`;
    return [++count, base];
  }
  return [count, base];
};

Engine.advancedSearch = async advancedSearch => {
  debugPrinter.printFunction("Engine.advancedSearch");
  // WHERE ?=?, and ?
  let options = ["ethnicity", "gender", "major"];
  let base = "",
    count = 0;
  [count, base] = helper_cluster(advancedSearch.ethnicity, options[0], count, base);
  [count, base] = helper_cluster(advancedSearch.gender, options[1], count, base);
  [count, base] = helper_cluster(advancedSearch.major, options[2], count, base);
  base += ";";

  //filter: [eth:[] major:[] gender: []]

  debugPrinter.printFunction("BASE: ");
  debugPrinter.printFunction(base);
  try {
    let baseSQL = "SELECT u.id,u.title, u.ethnicity, u.major, u.profilepic, u.username, u.name FROM users u " + base;
    console.log(baseSQL);
    let [r, fields] = await db.execute(baseSQL);
    return r && r.length ? r : await Engine.getallPosts();
  } catch (err) {
    return false;
  }
};

const filterHelper = (option, filter_name, count, base) => {
  tempcount = count;
  tempbase = base;
  console.log(option);
  for (x of option) {
    [tempcount, tempbase] = helper_cluster(x, filter_name, tempcount, tempbase);
  }
  return [tempcount, tempbase];
};

Engine.filterSearch = async filteredSearchArray => {
  debugPrinter.printFunction("Engine.advancedSearch");
  let options = ["ethnicity", "gender", "major"];
  let base = "",
    count = 0;

  debugPrinter.printSuccess(filteredSearchArray[0].ethnicity);
  [count, base] = filterHelper(filteredSearchArray[0].ethnicity, options[0], count, base);
  [count, base] = filterHelper(filteredSearchArray[0].gender, options[1], count, base);
  [count, base] = filterHelper(filteredSearchArray[0].major, options[2], count, base);
  base += ";";
  //filter: [eth:[] major:[] gender: []]

  debugPrinter.printFunction("BASE: ");
  debugPrinter.printFunction(base);
  try {
    let baseSQL = "SELECT u.id,u.title, u.ethnicity, u.major, u.profilepic, u.username, u.name FROM users u " + base;
    console.log(baseSQL);
    let [r, fields] = await db.execute(baseSQL);
    return r && r.length ? r : await Engine.getallPosts();
  } catch (err) {
    return false;
  }
};

module.exports = Engine;
