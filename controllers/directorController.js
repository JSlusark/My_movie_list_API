const { Director } = require("../models/Director");
const { Movie } = require("../models/Movie");

const getDirectorList = async (req, res) => {
  try {
    const directors = await Director.find().lean();
    // do not want to show movies in the director list, but in the individual director view
    // for (const director of directors) {
    //   director.movies = await Movies.find({ director: director._id }).select(
    //     "_id title",
    //   );
    // }
    res.status(200).json(directors);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
};

const getDirectorName = async (req, res) => {
  try {
    const director = await Director.findOne({
      name: req.params.name,
    }).lean();
    if (!director) {
      return res.status(404).send("Director not found");
    }
    director.movies = await Movies.find({ director: director._id }).select(
      "_id title",
    );
    res.json(director);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
};

module.exports = { getDirectorList, getDirectorName };
