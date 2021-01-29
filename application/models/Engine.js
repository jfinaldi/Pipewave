var db = require("../config/database");

const Engine = {};

Engine.getPosts = async limit => {
  let baseSQL =
    "SELECT u.username, p.id, p.title, p.description, p.resumepath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY created DESC LIMIT ?";
  let [r, fields] = await db.query(baseSQL, [limit]);
  return r;
};
Engine.search = async search => {
  try {
    let baseSQL =
      "SELECT id, title, description, concat_ws(' ', title, description) AS haystack FROM posts HAVING haystack like ?;";
    let sqlready = "%" + search + "%";
    let [r, fields] = await db.execute(baseSQL, [sqlready]);
    return r && r.length ? r : await Engine.getPosts(10);
  } catch (err) {
    return false;
  }
};

Engine.getPost = async id => {
  try {
    var baseSQL =
      "SELECT u.id, u.username, p.title, p.description, p.resumepath, p.created FROM users u JOIN posts p ON u.id=fk_userid WHERE p.id=?;";
    let [r, fields] = await db.query(baseSQL, [id]);
    return r;
  } catch (err) {
    console.log("post doesnt exist");
    return null;
  }
};
module.exports = Engine;
