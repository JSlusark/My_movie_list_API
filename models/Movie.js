const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
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

const Movie = mongoose.model("Movie", movieSchema);

module.exports.Movie = Movie;
