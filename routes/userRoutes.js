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

//get username, password or image
userRoutes.get("/profile", (req, res, next) => {
  const userID = req.user._id;
  User.findById(userID)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      console.log(err);
    });
});

//change username, password or image
userRoutes.put("/profile", (req, res, next) => {
  const userID = req.user._id;
  User.findByIdAndUpdate(userID, req.body)
    .then(updatedUser => {
      res.status(200).json(updatedUser);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = userRoutes;
