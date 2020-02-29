const express = require("express");
const bodyParser = require("body-parser");

const port = 4500;
const placeRoutes = require("./routes/places-routes");

const app = express();

app.use("/api/places", placeRoutes); //=> /api/places/...(the filter that will direct to that url)

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "an unkown error occurred!" });
}); //only trigger if there is an error attach to res, error handling

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
