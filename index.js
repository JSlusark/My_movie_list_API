const app = require("./app"); //
const mongoose = require("mongoose"); // mongoose is used to connect to MongoDB: https://mongoosejs.com/docs/connections.html

const getDbURI = () => {
  if (process.env.CONNECTION_URI) {
    console.log(
      "Env found: project is most likely running on the cloud server with npm start command. Using CONNECTION_URI from injected env vars.",
    );
    return process.env.CONNECTION_URI;
  }
  console.warn("Env not found: project can run only locally. If using the cloud server, please make sure to set the env vars for connection URI to avoid this outcome.");
  return "mongodb://127.0.0.1:27017/myflix";
};

mongoose.connect(getDbURI(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});


