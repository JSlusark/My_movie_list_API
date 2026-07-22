const { Genre } = require("../models/Genre");
const { Movie } = require("../models/Movie");

const getGenreList = async (req, res) => {
  try {
    const genres = await Genre.find().lean();
    // do not want to show movies in the genre list
    // for (const genre of genres) {
    //   genre.movies = await Movie.find({ genre: genre._id }).select(
    //     "_id title",
    //   );
    // }
    res.status(200).json(genres);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
};

const getGenreName = async (req, res) => {
    try {
      const genre = await Genre.findOne({ name: req.params.name }).lean();
      if (!genre) {
        return res.status(404).send("Genre not found");
      }
      genre.movies = await Movie.find({ genre: genre._id }).select(
        "_id title",
      );
      res.json(genre);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  };

module.exports = { getGenreList, getGenreName };
