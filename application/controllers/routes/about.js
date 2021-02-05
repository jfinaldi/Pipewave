var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.render("about/about", {
    unique: "About",
  });
});
router.get("/:user", async (req, res, next) => {
  let user = req.params.user;
  res.render(`about/users/${user}`, {
    unique: user,
    render_css_files: ["aboutus"],
  });
});
module.exports = router;
