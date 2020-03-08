const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, //this unique here just create a unique index for faster query
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, require: true, ref: "Place" }] //user can have multiple places, hence uses an arr
});

userSchema.plugin(uniqueValidator); // this validate whether the email already exist

module.exports = mongoose.model("User", userSchema); //create a collection named User
