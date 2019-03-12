const express = require("express");
const ratioRoutes = express.Router();

const User = require("./../models/User");
const Company = require("../models/Company");

ratioRoutes.post("/createcompany", (req, res, next) => {
  const userID = req.user._id;

  Company.create({
    name: req.body.name,
    industry: req.body.industry,
    initial_data: [
      {
        actives: req.body.actives,
        pasives: req.body.pasives,
        date_submission: req.body.date
      }
    ],
    owned_by: userID,
    logo: req.body.logo,
    scores: [
      {
        acid_reason: req.body.actives / req.body.pasives,
        equity_vs_debt: req.body.actives - req.body.pasives,
        date_submission: req.body.date
      }
    ],
    general_index_score: req.body.actives + req.body.pasives
  })
    .then(newCompany => {
      res.json(newCompany);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = ratioRoutes;
