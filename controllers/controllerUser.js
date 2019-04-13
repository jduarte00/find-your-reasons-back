const User = require("../models/User");
const App = require("../models/App");

// to get the panel

module.exports.getPanel = (req, res, next) => {
  const userID = req.user._id;

  App.find({ developed_by: userID })
    .populate("months")
    .populate("lastMonth")
    .then(data => {
      let theAnswer = {};

      if (data.length >= 1) {
        /* Table generation */

        let tableData = data.map((current, index) => {
          return {
            key: index,
            name: current.name,
            view: current._id
          };
        });

        /* Get the sum of all the incomes, expenses and users of the last submited period */

        const today = new Date().toString();
        const actualYear = parseInt(today.split(" ")[3]);
        const actualMonth = parseInt(new Date().getMonth());
        let previousMonth;
        let previousYear;
        if (actualMonth === 0) {
          previousMonth = 11;
          previousYear = actualYear - 1;
        } else {
          previousMonth = actualMonth - 1;
          previousYear = actualYear;
        }

        /* Find if there are any  sell generation apps*/

        const soldApps = data.filter(app => {
          return app.incomeGeneration !== "saas";
        });

        let allIncomes = 0;
        let allExpenses = 0;
        let allUsers = 0;
        let allIncomesPastPeriod = 0;
        let allExpensesPastPeriod = 0;
        let allUsersPastPeriod = 0;

        if (soldApps.length > 0) {
          const thisMonthSoldApps = soldApps.filter(app => {
            return (
              app.createdOn.getFullYear() === actualYear &&
              app.createdOn.getMonth() === actualMonth
            );
          });
          const lastMonthSoldApps = soldApps.filter(app => {
            return (
              app.createdOn.getFullYear() === previousYear &&
              app.createdOn.getMonth() === previousMonth
            );
          });

          if (thisMonthSoldApps.length > 0) {
            thisMonthSoldApps.forEach(app => {
              allIncomes += app.sellingPrice;
              allExpenses += app.totalCostOfDevelopment;
            });
          }

          if (lastMonthSoldApps.length > 0) {
            lastMonthSoldApps.forEach(app => {
              allIncomesPastPeriod += app.sellingPrice;
              allExpensesPastPeriod += app.totalCostOfDevelopment;
            });
          }
          console.log(
            thisMonthSoldApps,
            "this month",
            lastMonthSoldApps,
            "last month"
          );
        }

        /* Get the latest period months */
        let latestPeriodApps = data.map(app => {
          if (app.months.length > 0) {
            if (
              app.lastMonth.year === actualYear &&
              app.lastMonth.month === actualMonth
            ) {
              return app;
            }
          } else {
            return "noData";
          }
        });

        let atLeastOneMonth = false;

        for (let i = 0; i < latestPeriodApps.length; i++) {
          if (latestPeriodApps[i] && latestPeriodApps[i].months) {
            atLeastOneMonth = true;
          }
        }

        console.log(atLeastOneMonth, "at least one month");

        if (atLeastOneMonth) {
          /* Get the periods before the last one */

          const notThatLatePeriodApps = data.map(app => {
            let month = app.months.filter(month => {
              return (
                month.year === previousYear && month.month === previousMonth
              );
            });

            if (month.length) {
              return month;
            } else {
              return "nada";
            }
          });

          const notThatLateMonths = notThatLatePeriodApps.filter(
            month => month !== "nada"
          );

          /* Get the sum af all incomes, expenses and users */

          const mainGraphArray = [];
          let allHostingExpenses = 0;
          let allDomainExpenses = 0;
          let allDatabaseExpenses = 0;
          let allBucketExpenses = 0;
          let allOtherExpenses = 0;

          console.log(latestPeriodApps, "lates not so new");

          latestPeriodAppsFinal = latestPeriodApps.filter(app => {
            return app !== "noData" && app !== undefined;
          });
          console.log(latestPeriodAppsFinal, "latest period passsssss new");

          latestPeriodAppsFinal.forEach(eachApp => {
            (allIncomes += eachApp.lastMonth.incomes),
              (allExpenses += eachApp.lastMonth.expenses),
              (allUsers += eachApp.lastMonth.kpiMonth.totalUsers);
            mainGraphArray.push({
              label: eachApp.name,
              data: [
                eachApp.lastMonth.incomes,
                eachApp.lastMonth.expenses,
                eachApp.lastMonth.kpiMonth.totalUsers
              ],
              backgroundColor: "rgba(255, 99, 132, 0.6)"
            });
            allHostingExpenses += eachApp.lastMonth.allExpenses[0].value;
            allDomainExpenses += eachApp.lastMonth.allExpenses[1].value;
            allDatabaseExpenses += eachApp.lastMonth.allExpenses[2].value;
            allBucketExpenses += eachApp.lastMonth.allExpenses[3].value;
            allOtherExpenses += eachApp.lastMonth.allExpenses[4].value;
          });

          const expensesGraphArray = {
            labels: ["Hosting", "Domain", "Database", "Bucket", "Other"],
            dataSeries: [
              allHostingExpenses,
              allDomainExpenses,
              allDatabaseExpenses,
              allBucketExpenses,
              allOtherExpenses
            ]
          };

          /* Get the sum of all incomes, expenses and users for the not that late moths */

          notThatLateMonths.forEach(month => {
            allIncomesPastPeriod += month[0].incomes;
            allExpensesPastPeriod += month[0].expenses;
            allUsersPastPeriod += month[00].kpiMonth.totalUsers;
          });

          /* Get differences for the you vs last period section */

          let incomeDifference;
          let expensesDifference;
          let usersDifference;

          if (allIncomesPastPeriod) {
            incomeDifference = allIncomes - allIncomesPastPeriod;
            expensesDifference = allExpenses - allExpensesPastPeriod;
            usersDifference = allUsers - allUsersPastPeriod;
          } else {
            incomeDifference = false;
            expensesDifference = false;
            usersDifference = false;
          }

          /* Get the data series for the graph */

          theAnswer = {
            tableData,
            allIncomes,
            allExpenses,
            allUsers,
            mainGraphArray,
            incomeDifference,
            expensesDifference,
            usersDifference,
            expensesGraphArray
          };
        } else {
          theAnswer = { tableData, noMonths: true };
        }
      } else {
        theAnswer = { noData: true };
      }
      res.json(theAnswer);
    })
    .catch(err => {
      console.log(err);
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

// to get the name and income type of all the apps

module.exports.geIncomeType = (req, res, next) => {
  const userID = req.user._id;
  User.findById(userID)
    .populate("registered_apps")
    .then(user => {
      const nameOfApps = user.registered_apps.map(app => {
        return {
          name: app.name,
          type: app.incomeGeneration,
          users: app.userTypes,
          appID: app._id
        };
      });
      res.status(200).json(nameOfApps);
    });
};
