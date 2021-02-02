var db = require("../config/database");

const Review = {};
//
Review.addReview = async (comment, postid, userid) => {
  var baseSQL =
    "INSERT INTO `reviews` (`comment`,`fk_postid_c`,`fk_userid_c`,`created`) VALUES (?,?,?,now());";
  await db.execute(baseSQL, [comment, postid, userid]);
};
Review.getReviews = async (postid, limit) => {
  //TODO: Maybe add limit to amount of Reviews to get on each individual post
  //TO ADD just LIMIT ? at end of SQL line
  let getReview = "SELECT AVG(review) as avg FROM reviews WHERE fk_postid_c=?;";
  let [r, fields] = await db.query(getReview, [postid]);
  let avg = parseFloat(r[0].avg).toFixed(2);

  let baseSQL1 =
    "SELECT u.name,u.title, u.username, p.id, c.comment, c.created FROM posts p JOIN reviews c JOIN users u ON u.id=fk_userid_c ON p.id=fk_postid_c WHERE p.id=? ORDER BY created DESC";
  let [r1, fields2] = await db.query(baseSQL1, [postid]);
  console.log(r1);
  r1.avg = avg;
  return r1;
};

module.exports = Review;
