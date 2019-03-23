const express = require("express");
const appRoutes = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User");
const App = require("../models/App");

//To create a new company
appRoutes.post("/createapp", (req, res, next) => {
  const userID = req.user._id;

  App.create({
    name: req.body.name,
    clasification: req.body.clasification,
    size: req.body.size,
    incomeGeneration: req.body.incomeGeneration,
    supportedPlatforms: req.body.supportedPlatforms,
    developed_by: userID
  })
    .then(newApp => {
      User.find({ _id: userID }).then(user => {
        user[0].registered_apps.push(newApp._id);
        user[0].save(user => {
          res.json(newApp);
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
});
// To view an existing company

appRoutes.get("/viewcompany/:id", (req, res, next) => {
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

appRoutes.put("/editcompany/:id", (req, res, next) => {
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

appRoutes.delete("/deleteapp/:id/", (req, res, next) => {
  const userID = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  App.findByIdAndRemove(req.params.id)
    .then(() => {
      User.findById(userID).then(user => {
        const index = user.registered_apps.indexOf(req.params.id);
        user.registered_apps.splice(index, 1);
        user.save(newUser => {
          res.json({
            index: index
          });
        });
      });
    })
    .catch(err => {
      res.json(err);
    });
});

//To view entrepreneur

appRoutes.get("/viewentrepreneur", (req, res, next) => {
  Company.find({ owned_by: req.user._id })
    .then(allCompanies => {
      res.status(200).json(allCompanies);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = appRoutes;
