const mongoose = require("mongoose");

const directorSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  birthYear: Number,
  deathYear: {type: Number, default: null},
});

const Director = mongoose.model("Director", directorSchema);

module.exports.Director = Director;
