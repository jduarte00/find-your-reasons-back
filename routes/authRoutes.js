const express = require("express");
const authRoutes = express.Router();
const authController = require("../controllers/controllerAuth");

//To signup
authRoutes.post("/signup", authController.signup);

//To login
authRoutes.post("/login", authController.login);

authRoutes.post("/logout", authController.logout);

authRoutes.get("/loggedin", authController.loggedIn);

module.exports = authRoutes;
