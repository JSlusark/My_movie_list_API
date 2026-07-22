const cors = require("cors");

const allowedOrigins = [
  "http://localhost:1234",
  "https://mymovielistj.netlify.app",
];

module.exports = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(
        new Error(
          `The CORS policy for this application doesn't allow access from "${origin}"`
        ),
        false
      );
    }
    return callback(null, true);
  },
});
