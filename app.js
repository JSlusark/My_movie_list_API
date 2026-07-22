//  Sets up server, middleware, routes, and error handling.


const express = require("express"); // used to create the backend server
// Morgan is used to log requests to the console 
const morgan = require("morgan");
// Body parser is used to parse request bodies before they reach the route handlers
const bodyParser = require("body-parser"); 
// Passport is used for authentication
const passport = require("passport"); // used for authentication

const app = express();
app.use(morgan(`common`)); // TODO: substitute morgan with pino or winston for better logging
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); // urlencoded payloads
app.use(require("./middleware/cors"));
require("./middleware/passport.js"); // registers passport strategies 
app.use(passport.initialize());

// Routes
app.use("/login",  require("./routes/auth"));
app.use("/users",  require("./routes/users"));
app.use("/movies", require("./routes/movies"));
app.use("/genres", require("./routes/genres"));
app.use("/directors", require("./routes/directors"));
app.use(express.static("public"));
app.use("/docs", require("./routes/docs"));

app.use(require("./middleware/errorHandler"));

module.exports = app;