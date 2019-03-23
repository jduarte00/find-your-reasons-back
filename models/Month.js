const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const App = require("./App");

const monthSchema = new Schema({
  month: String,
  year: Number,
  date: { type: Date, default: Date.now },
  Incomes: Schema.Types.Mixed,
  Expenses: Schema.Types.Mixed,
  belongsToApp: { type: Schema.Types.ObjectId, ref: "App" },
  kpiMonth: [
    {
      acid_reason: Number,
      equity_vs_debt: Number,
      totalRevenue: Number
    }
  ]
});

const Month = mongoose.model("Month", monthSchema);

export default Month;
