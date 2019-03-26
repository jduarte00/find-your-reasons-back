const User = require("../models/User");
const App = require("../models/App");

// to get the panel

module.exports.getPanel = (req, res, next) => {
  const userID = req.user._id;

  App.find({ developed_by: userID })
    .then(data => {
      let tableData = data.map((current, index) => {
        return {
          key: index,
          name: current.name,
          view: current._id
        };
      });

      let theAnswer = {
        tableData: tableData
      };

      res.json(theAnswer);
    })
    .catch(err => {
      res.json(err);
    });
};

// to get only the username, password and profile image

module.exports.getUserInfo = (req, res, next) => {
  const userID = req.user._id;
  User.findById(userID)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      console.log(err);
    });
};

// to change the username, password or profile image

module.exports.changeUserInfo = (req, res, next) => {
  const userID = req.user._id;
  User.findByIdAndUpdate(userID, req.body)
    .then(updatedUser => {
      res.status(200).json(updatedUser);
    })
    .catch(err => {
      console.log(err);
    });
};
