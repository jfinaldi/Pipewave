const mysql = require("mysql2");

const pool = mysql.createPool({
  connectionLimit: 100,
  host: "35.235.77.107",

  user: "teamproject",
  password: "teamprojectgc04!",
  database: "website",
  //   debug: true,
});

const promisePool = pool.promise();

module.exports = promisePool;
