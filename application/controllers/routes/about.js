var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.render("about/about", {
    unique: "about",
  });
});
router.get("/:user", async (req, res, next) => {
  let user = req.params.user;
  res.render(`about/users/${user}`, {
    unique: user,
  });
});
module.exports = router;