const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const App = require("./App");

const monthSchema = new Schema({
  month: Number,
  year: Number,
  monthName: String,
  date: { type: Date, default: Date.now },
  usersAndPrice: Schema.Types.Array,
  allExpenses: Schema.Types.Array,
  incomes: Number,
  expenses: Number,
  belongsToApp: { type: Schema.Types.ObjectId, ref: "App" },
  kpiMonth: {}
});

const Month = mongoose.model("Month", monthSchema);

module.exports = Month;
