const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

DUMMY_USERS = [
  {
    id: "u1",
    name: "ken",
    email: "test@test.com",
    password: "tester"
  }
];

const getUsers = async (req, res, next) => {
  // if (!DUMMY_USERS || DUMMY_USERS.length === 0) {
  //   throw new HttpError("could not find any users ", 404);
  //   // this will trigger the error handling in app.js
  // }
  // res.json({ DUMMY_USERS });
  let users;
  try {
    users = await User.find({}, "-password"); // do not return object with the property name password
  } catch (err) {
    const error = new HttpError(
      "fetching users failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { name, email, password} = req.body;

  // const hasUser = DUMMY_USERS.find(u => u.email === email);
  // if (hasUser) {
  //   throw new HttpError("Could not create user, email already exists.", 422);
  // }
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later...",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "user exists already, please lgin instead",
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "httib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80",
    password,
    places:[]
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not create user",
      500
    );
    return next(error);
  }
  res.status(200).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login failed, please try again later...", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("invalid credentials, cod not log you in", 401);
    return next(error);
  }
  res.json({ message: "logged in!" });
};

module.exports = {
  getUsers,
  signup,
  login
};
