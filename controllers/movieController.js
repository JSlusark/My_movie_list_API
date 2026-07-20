const { Movie } = require("../models/Movie");


const getMovieList = (req, res) => {
    Movie.find()
      .populate("genre director")
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  };


const getMovieTitle = (req, res) => {
    Movie.findOne({ title: req.params.title })
      .populate("genre director")
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  };

  module.exports = { getMovieList, getMovieTitle };