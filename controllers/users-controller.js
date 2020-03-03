const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

DUMMY_USERS = [
  {
    id: "u1",
    name: "ken",
    email: "test@test.com",
    password: "tester"
  }
];

const getUsers = (req, res, next) => {
  if (!DUMMY_USERS || DUMMY_USERS.length === 0) {
    throw new HttpError("could not find any users ", 404);
    // this will trigger the error handling in app.js
  }
  res.json({ DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find(u => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists.", 422);
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password
  };
  DUMMY_USERS.push(createdUser);
  res.json({ DUMMY_USERS });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credential seem to be wrong,",
      401
    );
  }
  res.json({ message: "logged in!" });
};

module.exports = {
  getUsers,
  signup,
  login
};
