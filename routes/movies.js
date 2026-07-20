const router = require("express").Router();
const passport = require("passport");
const movieController = require("../controllers/movieController");

router.get("/", passport.authenticate("jwt", { session: false }), movieController.getMovieList);
router.get("/:title", passport.authenticate("jwt", { session: false }), movieController.getMovieTitle);

module.exports = router;