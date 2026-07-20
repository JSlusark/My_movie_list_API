const { validationResult } = require("express-validator");
const { User } = require("../models/User");

const createUser = (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  let hashedPassword = User.hashPassword(req.body.password);

  User.findOne({ username: req.body.username }) // checks duplicate usernames in the database
    .then((user) => {
      if (user)
        return res.status(400).send(req.body.username + "already exists");
      return User.create({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        birthday: req.body.birthday,
      });
    })
    .then((user) => {
      res.status(201).json(user);
    })

    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
};

const getUser = (req, res) => {
  User.findOne({ username: req.params.username })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
};

const updateUser = (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  let hashedPassword = User.hashPassword(req.body.password);

  User.findOneAndUpdate(
    { username: req.params.username },
    {
      $set: {
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        birthday: req.body.birthday,
      },
    },
    { new: true },
  )
    .then((updatedUser) => {
      res.status(201).json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
};

// const getFavorites = (req, res) => {
//   User.findOne({ username: req.params.username })
//     .populate("favoriteMovies")
//     .then((user) => {
//       res.status(200).json(user.favoriteMovies);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Error: " + err);
//     });
// };

const addFavorite = (req, res) => {
  User.findOneAndUpdate(
    { username: req.params.username },
    {
      $push: { favoriteMovies: req.params.MovieID },
    },
    { new: true },
  )
    .then((updatedUser) => {
      // console.log(updatedUser, req.params);
      res.status(201).json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
};

const removeFavorite = (req, res) => {
  User.findOneAndUpdate(
    { username: req.params.username },
    {
      $pull: { favoriteMovies: req.params.MovieID },
    },
    { new: true },
  )
    .then((updatedUser) => {
      console.log(updatedUser);
      res.status(200).json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
};

const deleteUser = (req, res) => {
  User.findOneAndRemove({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send({ error: req.params.username + " was not found" });
      } else {
        res
          .status(200)
          .send({ message: req.params.username + " was deleted." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
};

const getUserList = (req, res) => {
  User.find()
    .then((User) => {
      res.status(201).json(User);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  addFavorite,
  removeFavorite,
  deleteUser,
  getUserList,
};