const express = require("express");
const appRoutes = express.Router();

const appController = require("../controllers/controllerApp");

//To create a new app

appRoutes.post("/createapp", appController.addNewApp);

// To view an existing app

appRoutes.get("/viewapp/:id", appController.viewApp);

// To edit an existing app

appRoutes.put("/editcompany/:id", appController.editApp);

// To delete an existing app

appRoutes.delete("/deleteapp/:id/", appController.deleteApp);

// To create a new month

appRoutes.post("/newmonth/:id", appController.createMonth);
module.exports = appRoutes;
