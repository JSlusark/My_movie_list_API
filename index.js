//Importing node modules
const express = require(`express`);
/**
 * Morgan is a HTTP request logger middleware for Node.js.
 * https://www.npmjs.com/package/morgan
 */
const morgan = require(`morgan`);
/**
 * Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
 * https://www.npmjs.com/package/mongoose
 * https://mongoosejs.com/
 * https://mongoosejs.com/docs/guide.html
 * https://mongoosejs.com/docs/api.html
 */
const mongoose = require("mongoose");
const bodyParser = require(`body-parser`);
const uuid = require(`uuid`);
const path = require(`path`);
const app = express();
// CORS middleware
/**
 * CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
 * https://www.npmjs.com/package/cors
 */
const cors = require("cors");
const { check, validationResult } = require("express-validator");
const Models = require("./models.js");

console.log("CONNECTION_URI:", process.env.CONNECTION_URI);

// DB Connection Atlas https://mongoosejs.com/docs/connections.html
const getDbURI = () => {
  if (process.env.CONNECTION_URI) {
    console.log(
      "Env found: project is most likely running on the cloud server with npm start command. Using CONNECTION_URI from injected env vars.",
    );
    return process.env.CONNECTION_URI;
  }
  // Stops the cloud server from running if the CONNECTION_URI env var is not set. This is to prevent the app from running with a local MongoDB connection in production.
  // Commented it out as depending on the server setup, it could cause a crash loop
  //   if (process.env.NODE_ENV === "production") {
  //     console.error("FATAL: CONNECTION_URI is required in production!");
  //     process.exit(1);
  //   }
  console.warn(
    "Env not found: project can run only locally. If using the cloud server, please make sure to set the env vars for connection URI to avoid this outcome.",
  );
  return "mongodb://127.0.0.1:27017/myflix";
};

mongoose.connect(getDbURI(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;
const Actors = Models.Actor;

app.use(morgan(`common`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let allowedOrigins = [
  "http://localhost:8080",
  "https://mymovielistj.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  }),
);

// Import Auth.js here
let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport.js");

//_______________________ Methods for User list _______________________

/**
 * Returns a list of all users
 * @method GET
 * @param {string} endpoint - /users
 * @param {function} callback - function(req, res)
 * @returns {object} - JSON object containing all users
 */
// READ:list of users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  },
);

// READ: details on a user
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  },
);

//CREATE: creates/adds a user
app.post(
  "/users",

  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed.",
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],

  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          console.log(user, req.body);
          return res.status(400).send(req.body.username + "already exists");
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  },
);

//UPDATE: updates user details (if you update just one detail it won't work, this might be changed later)
app.put(
  "/users/:username",
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed.",
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
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
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  },
);

// UPDATE: Add a movie to a user's list of favorites
app.post(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { favoriteMovies: req.params.MovieID },
      },
      { new: true },
    )
      .then((updatedUser) => {
        console.log(updatedUser, req.params);
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  },
);

//DELETE: removes a movie from a user MONGOOSE
app.delete(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { favoriteMovies: req.params.MovieID },
      },
      { new: true },
    )
      .then((updatedUser) => {
        console.log(updatedUser);
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  },
);

//DELETE removes a user
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res
            .status(400)
            .send({ error: req.params.username + " was not found" });
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
  },
);

//_______________________ Methods for movies collection _______________________
/**
 * Returns a list of all movies
 * @method GET
 * @param {string} endpoint - /movies
 * @param {function} callback - function(req, res)
 * @returns {object} - JSON object containing all movies
 */
//READ: list of movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .populate("genre director")
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  },
);

//READ: movie title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ title: req.params.title })
      .populate("genre director")
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  },
);

//_______________________ Genres collection _______________________

// READ: list of all genres
app.get(
  "/genres",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const genres = await Genres.find().lean();
      for (const genre of genres) {
        genre.movies = await Movies.find({ genre: genre._id }).select(
          "_id title",
        );
      }
      res.status(200).json(genres);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  },
);

// READ: genre by name
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const genre = await Genres.findOne({ name: req.params.name }).lean();
      if (!genre) {
        return res.status(404).send("Genre not found");
      }
      genre.movies = await Movies.find({ genre: genre._id }).select(
        "_id title",
      );
      res.json(genre);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  },
);

//_______________________ Directors collection _______________________

// READ: list of all directors
app.get(
  "/directors",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const directors = await Directors.find().lean();
      for (const director of directors) {
        director.movies = await Movies.find({ director: director._id }).select(
          "_id title",
        );
      }
      res.status(200).json(directors);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  },
);

// READ: director by name
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const director = await Directors.findOne({
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
  },
);

//_______________________ Other Methods _______________________

// Access static pages from the public folder as filename.html
app.use(express.static(`public`));

app.get("/docs", (req, res) => {
  res.sendFile("documentation.html", {
    root: path.join(__dirname, "public"),
  });
});

//_____ error handling ____
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Something's not right. Please try again later.");
});

//_____ Listening on port 8080 ____
// app.listen(8080, () => {
//   console.log("Your app is listening on port 8080.");
// }); new code below
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
