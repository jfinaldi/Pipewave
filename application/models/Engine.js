var db = require("../config/database");
const pdfReader = require("../controllers/helpers/pdf_handler");
const debugPrinter = require("../controllers/helpers/debug/debug_printer");
const User = require("./Users");

const Engine = {};

//grabs n amount of posts from db and returns the data
// Engine.getPosts = async limit => {
//   debugPrinter.printFunction("Engine.getPosts");
//   let baseSQL =
//     "SELECT u.username,u.name,u.profilepic,  p.id, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY created DESC LIMIT ?";
//   let [r, fields] = await db.query(baseSQL, [limit]);
//   return r;
// };

//get 
Engine.getPosts = async limit => {
  debugPrinter.printFunction("Engine.getPosts");
  try {
    let baseSQL = "SELECT * FROM website.users WHERE usertype=0 ORDER BY created DESC LIMIT ?;";
    let [r, fields] = await db.query(baseSQL, [limit]);
    return r;
  } catch (err) {
    res.send(err);
  }
};

// fetch all 
Engine.getAllPosts = async _ => {
  debugPrinter.printFunction("Engine.getPosts");
  let baseSQL = "SELECT * FROM website.users WHERE usertype=0 ORDER BY created DESC";
  let [r, fields] = await db.query(baseSQL);
  return r;
};

Engine.getPostsApiEndpoint = async (limit, filter, order = "DESC") => {
  //filter = created, reviews
  //Display descending: "DESC"
  debugPrinter.printFunction("Engine.getPostsApiEndpoint");
  debugPrinter.printDebug([limit, filter, order]);
  let baseSQL = "SELECT u.username,u.name,  p.id, p.title, p.description, p.resumePath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY ? ? LIMIT ?";
  let [r, fields] = await db.query(baseSQL, [filter, order, limit]);
  return r;
};

Engine.search = async search => {
  debugPrinter.printFunction("Engine.search");
  try {
    let baseSQL =
    "SELECT u.id,u.name,u.profilepic, u.title,u.created, u.username, concat_ws(' ', u.name, u.username, u.title) AS haystack FROM users u WHERE u.usertype=0 HAVING haystack like ?;";
    let sqlready = "%" + search + "%";
    let [r, fields] = await db.execute(baseSQL, [sqlready]);
    return r && r.length ? r : await Engine.getPosts(10);
  } catch (err) {
    return false;
  }
};

// get a single review
Engine.getPost = async id => {
  debugPrinter.printFunction("Engine.getPost");
  try {
    var baseSQL = "SELECT id, username, name, email, created, title, bio, profilepic, gender, ethnicity, major, resume FROM users WHERE id=?;";
    let [r, fields] = await db.query(baseSQL, [id]);
    console.log(r)
    return r;
  } catch (err) {
    debugPrinter.printWarning(`Post id: ${id} does not exist in the DB`);
    return null;
  }
};

// Get all reviews from 1 User
Engine.getUserPosts = async username => {
  debugPrinter.printFunction("Engine.getUserPosts");
  try {
    var baseSQL =
      "SELECT p.id as postid, p.role, p.title, p.description, p.resumePath,u.name,u.username, u.profilepic, p.created FROM users u JOIN posts p ON u.id=fk_userid WHERE u.username=?";
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
  debugPrinter.printFunction("Engine.updatePFP");
  try {
    console.log(fk_userid);
    let path = "/assets/photos/" + file.filename;
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

Engine.updateRES = async (file, fk_userid) => {
  debugPrinter.printFunction("Engine.updateRES");
  try {
    console.log(fk_userid);
    let path = "/assets/resumes/" + file.filename;
    // let tags = await pdfReader("./public" + path);
    debugPrinter.printDebug(fk_userid);
    // let path = "/assets/" + req.file.filename;
    var baseSQL = "UPDATE `website`.`users` SET `resume` = ? WHERE `id` = ?;";
    let [r, fields] = await db.query(baseSQL, [path, fk_userid]);
    debugPrinter.printDebug("Response", r);
    return r;
  } catch (err) {
    console.log("Couldnt update resume, boo.");
    return null;
  }
};

Engine.getRES = async(userid) => {
  debugPrinter.printFunction("Engine.getRES");
  console.log(userid);
  try {
    var baseSQL = "SELECT resume, name FROM users WHERE id=?";
    let [r, fields] = await db.query(baseSQL, [userid]);
    console.log(r[0]);
    return [r[0].resume, r[0].name];
  } catch (err) {
    console.log("Error, userid does not exist in db.");
    return null;
  }
};
// SELECT u.id, u.ethnicity, u.major, u.profilepic, u.username, u.name FROM users u WHERE `gender`="male" and `major`="Computer Science" and `ethnicity`="hispanic";

const helper_cluster = (x, filter_name, count, base) => {
  if (x) {
    console.log(filter_name + " passed in");
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
    return r && r.length ? r : await Engine.getAllPosts();
  } catch (err) {
    return false;
  }
};

const filterHelper = (option, filter_name, count, base) => {
  tempcount = count;
  tempbase = base;
  console.log(option);
  try {
    for (x of option) {
      [tempcount, tempbase] = helper_cluster(x, filter_name, tempcount, tempbase);
    }
  } catch (err) {
    [tempcount, tempbase] = helper_cluster(option, filter_name, tempcount, tempbase);
  }
  return [tempcount, tempbase];
};

// Grabs all filtered results 
Engine.filterSearch = async (filteredSearchArray, lastLogin) => {
  if (!filteredSearchArray) return;
  debugPrinter.printFunction("Engine.filterSearch");
  let options = ["ethnicity", "gender", "major"];
  let base = "",
    count = 0;
  let base2 = " ORDER BY u.created DESC;";

  console.log("Engine.filterSearch");
  console.log(lastLogin); //output one day ahead
  let baseSQL2 = "SELECT * from users WHERE `usertype`=0 AND UNIX_TIMESTAMP(`created`) < UNIX_TIMESTAMP(?);";
  let [r2, fields2] = await db.execute(baseSQL2, [lastLogin]); // this gives us a whole list of all students who are new since last login
  if(r2 && r2.length) {
    console.log("outputting r2: ");
    for(i = 0; i < r2.length; i++){
      console.log(r2[i].username + "\t" + r2[i].created);
    }
  } else { console.log("r2 is empty."); }

  debugPrinter.printSuccess(filteredSearchArray[0].ethnicity);
  [count, base] = filterHelper(filteredSearchArray[0].ethnicity, options[0], count, base);
  [count, base] = filterHelper(filteredSearchArray[0].gender, options[1], count, base);
  [count, base] = filterHelper(filteredSearchArray[0].major, options[2], count, base);
  //filter: [eth:[] major:[] gender: []]

  debugPrinter.printFunction("BASE: ");
  debugPrinter.printFunction(base);
  try {
    //let baseSQL = "SELECT u.id,u.title, u.ethnicity, u.major, u.profilepic, u.username, u.name FROM users u " + base;
    let baseSQL = "SELECT u.id,u.title, u.ethnicity, u.major, u.profilepic, u.username, u.name FROM users u " + base + base2;
    console.log(baseSQL);
    let [r, fields] = await db.execute(baseSQL); // this gives us a list of all relevant search items
    return r && r.length ? r : await Engine.getAllPosts();
  } catch (err) {
    return false;
  }
};


module.exports = Engine;
