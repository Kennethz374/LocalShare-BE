const HttpError = require("../models/http-error");
const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

let DUMMY_PLACES = [
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

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(u => {
    return u.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError("could not find place with provided user id", 404)
    ); // this will trigger the error handling in app.js, handle asyn for data base later
  }
  res.json({ places });
};

const createPlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }
  const { title, description, coordinates, address, creator } = req.body;
  //const title = req.body.title
  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace); // unshift(createdPlace)

  res.status(201).json({ place: createdPlace });
}; //post request has a req.body

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }; // this will copy and create a new obj of place
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError("Could not find a place for that id", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: "deleted places" });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  deletePlace,
  updatePlace
};

// function getPlaceById() { ... }
// const getPlaceById = function () {...}
