const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

// let DUMMY_PLACES = [
//   {
//     id: "p1",
//     title: "great wall in china",
//     description: "one of the most famous place to visit",
//     location: {
//       lat: 40.784474,
//       lng: -73.9871516
//     },
//     Address: "ALKDSJFALKSDJF;ALKSJDF;ADSF",
//     creator: "u1"
//   }
// ];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId); //doesnot return promise, use exec() to get a promise back
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place", // if get req doesnt work return this error
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "could not find place with provided place id",
      404
    ); //get req success, but found not such place error
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) }); // return a workable object, and change _id to id (String)
};
//middelware function focused

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId }); //in no argument return everything, mongoose method
  } catch (err) {
    const error = new HttpError(
      "Could not find places with provided user id",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("could not find place with provided user id", 404)
    ); // this will trigger the error handling in app.js, handle asyn for data base later
  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  //const title = req.body.title
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
    creator
  });
  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again...",
      500
    );
    return next(error);
  }

  // DUMMY_PLACES.push(createdPlace); // unshift(createdPlace)

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
