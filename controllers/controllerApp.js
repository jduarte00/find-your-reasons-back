const mongoose = require("mongoose");

const User = require("../models/User");
const App = require("../models/App");
const Month = require("../models/Month");

const simpleSalesForecasting = require("simple-sales-forecasting");

//To create a new App

module.exports.addNewApp = (req, res, next) => {
  const userID = req.user._id;
  const theData = req.body.infoToSend;
  App.create({
    name: theData.name,
    category: theData.category,
    size: theData.size,
    incomeGeneration: theData.incomeGeneration,
    supportedPlatforms: theData.supportedPlatforms,
    userTypes: theData.userTypes,
    sellingPrice: theData.sellingPrice,
    totalCostOfDevelopment: theData.totalCostOfDevelopment,
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
    res.status(400).json(req.params.id);
    return;
  }

  App.findById(req.params.id)
    .populate("months")
    .then(theApp => {
      const response = {};

      /* Sort all the months in ascendent order */

      if (theApp.incomeGeneration === "saas") {
        let latestYear = 2019;

        let finalSorted = [];

        do {
          let monthSorted = [];
          theApp.months.forEach(eachMonth => {
            eachMonth.year === latestYear ? monthSorted.push(eachMonth) : null;
          });
          for (let i = 11; i >= 0; i--) {
            monthSorted.forEach(eachMonth => {
              eachMonth.month === i ? finalSorted.push(eachMonth) : null;
            });
          }
          latestYear--;
        } while (finalSorted.length < theApp.months.length);

        //Get the differences between the last month and the month before it

        if (finalSorted.length >= 2) {
          const lastMonth = finalSorted[0];
          const theMonthBefore = finalSorted[1];
          response.incomeDifference =
            lastMonth.incomes - theMonthBefore.incomes;
          response.expensesDifference =
            lastMonth.expenses - theMonthBefore.expenses;
          response.userDifference =
            lastMonth.kpiMonth.totalUsers - theMonthBefore.kpiMonth.totalUsers;
        } else {
          response.kpiError = true;
        }

        //Get the data series arrays

        response.incomeDataSeries = [];
        response.dataLabels = [];
        response.expensesDataSeries = [];
        response.usersDataSeries = [];

        const reversedDataSorted = finalSorted.reverse();

        reversedDataSorted.forEach(month => {
          response.incomeDataSeries.push(month.incomes);
          response.dataLabels.push(`${month.monthName} ${month.year}`);
          response.expensesDataSeries.push(month.expenses);
          response.usersDataSeries.push(month.kpiMonth.totalUsers);
        });

        /* Build the array for the display of the table */

        response.tableDisplayArray = response.dataLabels.map(
          (currentLabel, index) => {
            return {
              key: index,
              dataLabel: currentLabel,
              sales: response.incomeDataSeries[index],
              expenses: response.expensesDataSeries[index],
              users: response.usersDataSeries[index]
            };
          }
        );

        /* Get the forecast if the app have at least 8 values for sales*/

        if (response.incomeDataSeries.length >= 8) {
          const theForecast = simpleSalesForecasting(
            response.incomeDataSeries,
            4
          );
          response.forecast = {
            labels: response.dataLabels.concat(theForecast.time),
            forecastSeries: response.incomeDataSeries.concat(
              theForecast.predictions
            )
          };
        }
      }

      let date = theApp.createdOn.toDateString().split(" ");
      response.dayOfCreation = date[2];
      response.monthOfCreation = date[1];
      response.yearOfCreation = date[3];
      response.theApp = theApp;

      res.status(200).json(response);
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

  App.findById(appID)
    .populate("months")
    .populate("lastMonth")
    .then(app => {
      const monthAlreadyExist = [];

      app.months.forEach((month, index) => {
        if (month.month === theData.month && month.year === theData.year) {
          monthAlreadyExist.push(index);
        }
      });

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

      //calculation of the monthAndYearNumber

      const yearAndMonthNumber = parseInt(
        theData.year.toString() + theData.month.toString()
      );

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
        kpiMonth,
        yearAndMonthNumber
      };

      //Saving the final model

      console.log(monthAlreadyExist, "it already exist");

      if (monthAlreadyExist.length > 0) {
        thisMonth._id = app.months[monthAlreadyExist[0]]._id;
        app.months[monthAlreadyExist[0]] = thisMonth;
        app
          .save()
          .then(app => {
            console.log(app.lastMonth, "the last Month");
            let response = { status: "ok" };
            res.status(200).json(response);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        Month.create(thisMonth)
          .then(newMonth => {
            app.months.push(newMonth._id);
            if (app.lastMonth) {
              if (newMonth.year >= app.lastMonth.year) {
                if (newMonth.month >= app.lastMonth.month) {
                  app.lastMonth = newMonth._id;
                }
              }
            } else {
              app.lastMonth = newMonth._id;
            }
            app.save().then(app => {
              console.log(app.lastMonth, "the last month");
              let response = { status: "ok" };
              res.status(200).json(response);
            });
          })
          .catch(err => {
            let response = { status: "fucked" };
            res.status(400).json(response);
          });
      }
    });
};
