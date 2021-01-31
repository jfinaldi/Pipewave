var db = require("../config/database");

const Review = {};

Review.addReview = async (comment, post, userid) => {
  var baseSQL =
    "INSERT INTO `comments` (`description`,`fk_postid_c`,`fk_userid_c`,`created`) VALUES (?,?,?,now());";
  await db.execute(baseSQL, [comment, post, userid]);
};

module.exports = Review;
