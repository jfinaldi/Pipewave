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
  let getReview = "SELECT AVG(review) as avg FROM reviews WHERE fk_postid_c=?;";
  let [r, fields] = await db.query(getReview, [userid]);
  let avg = parseFloat(r[0].avg).toFixed(2);
  console.log(r[0].avg);

  let baseSQL1 =
    "SELECT u.id, u.username, u.name, u.email, u.usertype, u.created, u.bio, u.profilepic, u.gender, u.ethnicity, u.major, u.department, u.company, u.resume, c.comment, c.created FROM users u JOIN reviews c ON u.id=fk_userid_c WHERE c.fk_postid_c=? ORDER BY c.created DESC;";
  let [r1, fields2] = await db.query(baseSQL1, [userid]);
  return r1;
};

module.exports = Review;
