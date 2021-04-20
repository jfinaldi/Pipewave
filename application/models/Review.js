var db = require("../config/database");

const Review = {};
//
//
Review.addReview = async (comment, postid, userid) => {
  var baseSQL = "INSERT INTO `reviews` (`comment`,`fk_postid_c`,`fk_userid_c`,`created`) VALUES (?,?,?,now());";
  await db.execute(baseSQL, [comment, postid, userid]);
};

Review.getReviews = async (userid, limit) => {
  //TODO: Maybe add limit to amount of Reviews to get on each individual post
  //TO ADD just LIMIT ? at end of SQL line
  let getReview = "SELECT AVG(review) as avg FROM reviews WHERE fk_userid_c=?;";
  let [r, fields] = await db.query(getReview, [userid]);
  let avg = parseFloat(r[0].avg).toFixed(2);

  let baseSQL1 =
    "SELECT u.id, u.username, u.name, u.email, u.created, u.title, u.bio, u.profilepic, u.gender, u.ethnicity, u.major, u.resume, c.comment, c.created FROM users u JOIN reviews c ON u.id=fk_userid_c WHERE u.id=? ORDER BY c.created DESC";
  let [r1, fields2] = await db.query(baseSQL1, [userid]);
  console.log(r1);
  r1.avg = avg;
  return r1;
};

module.exports = Review;
