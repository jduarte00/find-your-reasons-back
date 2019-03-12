const express = require("express");
const userRoutes = express.Router();

const User = require("../models/User");
const Company = require("../models/Company");

//To get the panel
userRoutes.get("/panel", (req, res, next) => {
  const userID = req.user._id;
  Company.find({ owned_by: userID })
    .populate("owned_by")
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json(err);
    });
});

module.exports = userRoutes;
