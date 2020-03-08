const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const port = 4500;
const placeRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const app = express();

app.use(bodyParser.json());

app.use("/api/places", placeRoutes); //=> /api/places/...(the filter that will direct to that url)
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route");
  throw error;
}); // handle all routes that are not set up return an error message

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "an unkown error occurred!" });
}); //only trigger if there is an error attach to res, error handling

const connectUrl =
  "mongodb+srv://Kenneth:testing123@cluster0-qzcwd.mongodb.net/places?retryWrites=true&w=majority";
const connectConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
};

mongoose
  .connect(connectUrl, connectConfig) //if connection is ok
  .then(
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    })
  )
  .catch(err => {
    console.log(err);
  });
