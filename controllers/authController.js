const jwt = require("jsonwebtoken");
const passport = require("passport");

// TODO: need to import the secret as instead of hardcoding it here
const jwtSecret = "temp_secret";

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username,
    expiresIn: "7d",
    algorithm: "HS256", // encoding algo
  });
};

const login = (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(400).json({ message: "Something is not right", user });
    }
    req.login(user, { session: false }, (error) => {
      if (error) return res.send(error);
      let token = generateJWTToken(user.toJSON());
      return res.json({ user, token });
    });
  })(req, res);
};

module.exports = { login };