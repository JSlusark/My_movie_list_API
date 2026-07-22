const router = require("express").Router();
const path = require("path");

router.get("/", (req, res) => {
  res.sendFile("documentation.html", {
    root: path.join(__dirname, "..", "public"),
  });
});

module.exports = router;
