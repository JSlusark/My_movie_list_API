const router = require("express").Router();
const passport = require("passport");
const directorController = require("../controllers/directorController"); 


router.get("/",  passport.authenticate("jwt", { session: false }), directorController.getDirectorList); 
router.get("/:name", passport.authenticate("jwt", { session: false }), directorController.getDirectorName);


module.exports = router;