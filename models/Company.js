const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const companySchema = new Schema({
  name: String,
  industry: String,
  initial_data: [
    {
      actives: Number,
      pasives: Number,
	  totalSales: Number,
	  totalExpenses: Number,
      date_submission: { type: Date, default: Date.now }
    }
  ],
  owned_by: { type: Schema.Types.ObjectId, ref: "User" },
  scores: [
    {
      acid_reason: Number,
      equity_vs_debt: Number,
	  totalRevenue: Number,
      date_submission: { type: Date, default: Date.now }
    }
  ],
  general_index_score: Number
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
