module.exports = (error, req, res, next) => {
  console.error(error);
  res.status(500).send("Something's not right. Please try again later.");
};
