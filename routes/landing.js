const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("main/landing.ejs");
});

router.get("/regulamin", (req, res) => {
  res.render("main/regulamin.ejs");
});

module.exports = router;
