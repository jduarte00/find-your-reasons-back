const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Company = require("./Company");

const userSchema = new Schema({
  username: String,
  password: String,
  image: String,
  registered_companies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
  average_investing_index: Number
});

const User = mongoose.model("User", userSchema);

module.exports = User;
