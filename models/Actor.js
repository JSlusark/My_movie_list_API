const mongoose = require("mongoose");

const actorSchema = mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  birthYear: Number,
  deathYear: {type: Number, default: null},
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }], 
});

const Actor = mongoose.model("Actor", actorSchema);

module.exports.Actor = Actor;
