const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const { check } = require("express-validator");

const userValidation = [ 
  check("username", "Username is required").isLength({ min: 5 }),
  check(
    "username",
    "Username contains non alphanumeric characters - not allowed.",
  ).isAlphanumeric(),
  check("password", "Password is required").not().isEmpty(),
  check("email", "Email does not appear to be valid").isEmail(),
];

router.post("/", userValidation, userController.createUser); // We use "/" to refer to the base route for users, which is "/users" in this case
router.get("/:username", passport.authenticate("jwt", { session: false }), userController.getUser);
router.put("/:username", userValidation, passport.authenticate("jwt", { session: false }), userController.updateUser);
router.post("/:username/movies/:MovieID", passport.authenticate("jwt", { session: false }), userController.addFavorite);
router.delete("/:username/movies/:MovieID", passport.authenticate("jwt", { session: false }), userController.removeFavorite);
router.delete("/:username", passport.authenticate("jwt", { session: false }), userController.deleteUser);

// When adding admin role, this needs will need to change
router.get("/", passport.authenticate("jwt", { session: false }), userController.getUserList); 

module.exports = router;