const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const App = require("./App");

const userSchema = new Schema({
  username: String,
  password: String,
  image: String,
  registered_apps: [{ type: Schema.Types.ObjectId, ref: "App" }],
  average_developer_index: Number
});

const User = mongoose.model("User", userSchema);

module.exports = User;
