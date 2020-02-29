const HttpError = require("../models/http-error");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "great wall in china",
    description: "one of the most famous place to visit",
    location: {
      lat: 40.784474,
      lng: -73.9871516
    },
    Address: "ALKDSJFALKSDJF;ALKSJDF;ADSF",
    creator: "u1"
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError("could not find place with provided place id", 404);
    // this will trigger the error handling in app.js
  }
  res.json({ place });
};
//middelware function focused

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(u => {
    return u.creator === userId;
  });

  if (!place) {
    return next(
      new HttpError("could not find place with provided user id", 404)
    ); // this will trigger the error handling in app.js, handle asyn for data base later
  }
  res.json({ place });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;



// function getPlaceById() { ... }
// const getPlaceById = function () {...}
