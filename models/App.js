const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const appSchema = new Schema({
  name: String,
  clasification: String,
  size: String,
  incomeGeneration: String,
  supportedPlatforms: Schema.Types.Array,
  months: Schema.Types.Array,
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
