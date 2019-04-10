const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Month = require("./Month");

const appSchema = new Schema({
  name: String,
  category: String,
  size: String,
  incomeGeneration: String,
  supportedPlatforms: [],
  months: [{ type: Schema.Types.ObjectId, ref: "Month" }],
  userTypes: [],
  sellingPrice: Number,
  developed_by: { type: Schema.Types.ObjectId, ref: "User" },
  kpiGlobal: [
    {
      acid_reason: Number,
      equity_vs_debt: Number,
      totalRevenue: Number
    }
  ],
  general_app_score: Number
});

const App = mongoose.model("App", appSchema);

module.exports = App;
