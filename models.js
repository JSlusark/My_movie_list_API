const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Documentation: https://www.mongodb.com/docs/manual/data-modeling/
// https://mongoosejs.com/docs/models.html

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  creaetedAt: { type: Date, default: Date.now },
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

let movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, 
  genre: { type: mongoose.Schema.Types.ObjectId, ref: "Genre", required: true },
  director: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "Director",
	required: true,
  },
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
  imagePath: String,
});

let genreSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

let directorSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  birthYear: Number,
  deathYear: {type: Number, default: null},
});

let actorSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  birthYear: Number,
  deathYear: {type: Number, default: null},
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }], 
});


/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to be hashed.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Validates a password against the stored password hash.
 * @param {string} password - The password to be validated.
 * @returns {boolean} True if the password matches the hash, false otherwise.
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password); //Password in exercise
};

let User = mongoose.model("User", userSchema);
let Movie = mongoose.model("Movie", movieSchema);
let Genre = mongoose.model("Genre", genreSchema);
let Director = mongoose.model("Director", directorSchema);
let Actor = mongoose.model("Actor", actorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
module.exports.Director = Director;
module.exports.Actor = Actor;
