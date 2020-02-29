const express = require("express");

const router = express.Router(); // export router to app.js
const placesControllers = require("../controllers/places-controller");

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlaceByUserId);

module.exports = router;
