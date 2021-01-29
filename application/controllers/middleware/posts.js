const { post } = require("../app");
var db = require("../config/database");

const postMiddleware = {};

postMiddleware.getRecentPosts = async (req, res, next) => {
  try {
    // let baseSQL =
    // "SELECT id, title, description, thumbnail, created FROM posts ORDER BY created DESC LIMIT 10";
    let baseSQL =
      "SELECT u.username, p.id, p.title, p.description, p.resumepath, p.created FROM users u JOIN posts p ON u.id=fk_userid ORDER BY created DESC LIMIT 10";
    let [r, fields] = await db.execute(baseSQL, []);

    res.locals.results = r;

    if (r && r.length == 0) {
      req.flash("error", "there are no posts created yet");
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = postMiddleware;
