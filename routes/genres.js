const router = require("express").Router();
const passport = require("passport");
const genreController = require("../controllers/genreController");

router.get("/", passport.authenticate("jwt", { session: false }), genreController.getGenreList);
router.get("/:name", passport.authenticate("jwt", { session: false }), genreController.getGenreName);

module.exports = router;