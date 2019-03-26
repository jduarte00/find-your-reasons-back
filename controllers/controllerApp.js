const mongoose = require("mongoose");

const User = require("../models/User");
const App = require("../models/App");

//To create a new App

module.exports.addNewApp = (req, res, next) => {
  const userID = req.user._id;
  const theData = req.body.infoToSend;

  console.log(theData);

  App.create({
    name: theData.name,
    category: theData.category,
    size: theData.size,
    incomeGeneration: theData.incomeGeneration,
    supportedPlatforms: theData.supportedPlatforms,
    userTypes: theData.userTypes,
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
};

//To view an App

module.exports.viewApp = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  App.findById(req.params.id)
    .then(theApp => {
      res.status(200).json(theApp);
    })
    .catch(err => {
      console.log(err);
    });
};

//To edit an existing App

module.exports.editApp = (req, res, next) => {
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
        message: `App with ${req.params.id} is updated successfully.`
      });
    })
    .catch(err => {
      res.json(err);
    });
};

//To delete an exisiting App

module.exports.deleteApp = (req, res, next) => {
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
};
