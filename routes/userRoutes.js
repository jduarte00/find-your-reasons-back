const express = require("express");
const userRoutes = express.Router();

const userController = require("../controllers/controllerUser");

//To get the panel
userRoutes.get("/panel", userController.getPanel);

//get username, password or image
userRoutes.get("/profile", userController.getUserInfo);

//change username, password or image
userRoutes.put("/profile", userController.changeUserInfo);

module.exports = userRoutes;
