const express = require("express");
const ratioRoutes = express.Router();
const mongoose = require("mongoose");

const User = require("./../models/User");
const Company = require("../models/Company");

//To create a new company
ratioRoutes.post("/createcompany", (req, res, next) => {
  const userID = req.user._id;

  Company.create({
    name: req.body.name,
    industry: req.body.industry,
    initial_data: [
      {
        actives: req.body.actives,
        pasives: req.body.pasives,
		totalSales: req.body.totalSales,
		totalExpenses:req.body.totalExpenses,
        date_submission: req.body.date
      }
    ],
    owned_by: userID,
    scores: [
      {
        acid_reason: req.body.actives / req.body.pasives,
        equity_vs_debt: req.body.actives - req.body.pasives,
		totalRevenue: req.body.totalSales - req.body.totalExpenses,
        date_submission: req.body.date
      }
    ],
    general_index_score: req.body.actives + req.body.pasives
  })
    .then(newCompany => {
      User.find({ _id: userID }).then(user => {
        user[0].registered_companies.push(newCompany._id);
        user[0].save(user => {
          res.json(newCompany);
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
});
// To view an existing company

ratioRoutes.get("/viewcompany/:id", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Company.findById(req.params.id)
    .then(theCompany => {
      res.status(200).json(theCompany);
    })
    .catch(err => {
      console.log(err);
    });
});

// To edit an existing company

ratioRoutes.put("/editcompany/:id", (req, res, next) => {
  /* The req.body is {
    "lol": "un lol",
    "lolz": "un lolz"
} */

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Project.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({
        message: `Project with ${req.params.id} is updated successfully.`
      });
    })
    .catch(err => {
      res.json(err);
    });
});

// To delete an existing company

ratioRoutes.delete("/deletecompany/:id", (req, res, next) => {
  const userID = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Company.findByIdAndRemove(req.params.id)
    .then(() => {
      User.findById(userID).then(user => {
        const index = user.registered_companies.indexOf(req.params.id);
        user.registered_companies.splice(index, 1);
        user.save(newUser => {
          res.json({
            message: `Company with ${req.params.id} is removed successfully.`
          });
        });
      });
    })
    .catch(err => {
      res.json(err);
    });
});

//To view entrepreneur

ratioRoutes.get("/viewentrepreneur", (req, res, next) => {
  Company.find({ owned_by: req.user._id })
    .then(allCompanies => {
      res.status(200).json(allCompanies);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = ratioRoutes;
