const mongoose = require("mongoose");

const User = require("../models/User");
const App = require("../models/App");
const Month = require("../models/Month");

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
    sellingPrice: theData.sellingPrice,
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

//To create a new month

module.exports.createMonth = (req, res, next) => {
  const appID = req.params.id;
  const theData = req.body.infoToSend;
  console.log(theData);

  App.findById(appID)
    .populate("months")
    .then(app => {
      //Get the array with the price and amount of each user
      const usersAndPrice = app.userTypes.map((usertype, index) => {
        return {
          nameOfUser: usertype,
          amount: theData["userAmount" + index],
          price: theData["userPrice" + index]
        };
      });

      //calculate the income
      const incomes = usersAndPrice.reduce((reducer, current) => {
        return reducer + current.amount * current.price;
      }, 0);

      //Place all the expenses on an array
      const allExpenses = [
        { value: theData.hosting, name: "hosting" },
        { value: theData.domain, name: "domain" },
        { value: theData.database, name: "database" },
        { value: theData.bucket, name: "bucket" },
        { value: theData.others, name: "others" }
      ];

      //Calculate the total expense cost
      const expenses = allExpenses.reduce((reducer, current) => {
        return reducer + current.value;
      }, 0);

      //Calculation of the KPI's

      console.log(app, "the app");

      const prevMonth = app.months.filter(eachMonth => {
        return eachMonth.month === theData.month - 1;
      });

      let kpiMonth = {};

      const totalUsers = usersAndPrice.reduce((accum, currentUsers) => {
        return accum + currentUsers.amount;
      }, 0);

      if (prevMonth.length !== 0) {
        kpiMonth.differenceUsers =
          totalUsers - prevMonth[0].kpiMonth.totalUsers;
        kpiMonth.incomeVsLastMonth = incomes - prevMonth[0].incomes;
        kpiMonth.totalUsers = totalUsers;
      } else {
        kpiMonth.error =
          "Sorry, you didn't provide the month before, so the calculation of the KPI's could not be performed";
        kpiMonth.totalUsers = totalUsers;
      }

      //Building of the final object to store

      const thisMonth = {
        month: theData.month,
        year: theData.year,
        monthName: theData.nameMonth,
        date: theData.now,
        usersAndPrice,
        allExpenses,
        incomes,
        expenses,
        belongsToApp: appID,
        kpiMonth
      };

      //Saving the final model

      console.log(thisMonth);

      Month.create(thisMonth)
        .then(newMonth => {
          app.months.push(newMonth._id);
          app.save().then(app => {
            let response = { status: "ok" };
            res.status(200).json(response);
          });
        })
        .catch(err => {
          let response = { status: "fucked" };
          res.status(400).json(response);
        });
    });
};
