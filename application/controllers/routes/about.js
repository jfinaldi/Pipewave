var express = require("express");
var router = express.Router();

// Debug printer
const debugPrinter = require("../helpers/debug/debug_printer");

router.get("/", (req, res) => {
  debugPrinter.printRouter("/about");
  res.render("about/about", {
    unique: "About",
  });
});
//

router.get("/:user", async (req, res, next) => {
  debugPrinter.printRouter(`/${req.params.user}`);

  let user = req.params.user;
  res.render(`about/users/${user}`, {
    unique: user,
    render_css_files: ["aboutus"],
  });
});

module.exports = router;
