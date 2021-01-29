var db = require("../config/database");

const System = {};

System.getRating = async postid => {
  try {
    //TODO: make rating system database
    // let baseSQL;
    let [r, fields] = await db.query(baseSQL, [postid]);
    return r;
  } catch (err) {
    console.log("post doesnt exist");
    return null;
  }
};
System.addRating = async (username, postid, userid) => {
  try {
    //TODO: make rating system database
    // let baseSQL;
    let [r, fields] = await db.query(baseSQL, [username, postid, userid]);
    return [r, true];
  } catch (err) {
    console.log("post doesnt exist");
    return [null, false];
  }
};

module.exports = System;
