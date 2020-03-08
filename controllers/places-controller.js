const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

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
  //let userWithPlaces
  try {
    places = await Place.find({ creator: userId }); //in no argument return everything, mongoose method
    //userWithPlaces = await User.findById(userId).populate("places")   an alternative approach
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

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for the provided id", 404);
    return next(error);
  }
  console.log(user);

  try {
    //need to make sure that user can store in place, and place is created
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session }); // store the place
    user.places.push(createdPlace); //mongoose method push; add placeId to the places field in user
    await user.save({ session: session });
    await session.commitTransaction();
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

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }; // this will copy and create a new obj of place
  // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "somthing went wrong could not update place",
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "something is wrong, could not delete place",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess }); // delete the place
    place.creator.places.pull(place); //mongoose method push; remove placeId to the places field in user
    await place.creator.save({ session: sess }); //place.creator is actually the specific user
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "something is wrong, could not delete place why?",
      500
    );
    return next(error);
  }
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
