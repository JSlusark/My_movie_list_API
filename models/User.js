
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  createdAt: { type: Date, default: Date.now },
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});


// Hashing via bcrypt.
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// pwd validation via bcrypt
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password); //Password in exercise
};

// never re-assigned so should be const
const User = mongoose.model("User", userSchema);

module.exports.User = User;