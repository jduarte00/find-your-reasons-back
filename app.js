require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

require("./config/passport");

mongoose
  .connect(
    `mongodb://pepedev:${
      process.env.DATABASE
    }@ds021356.mlab.com:21356/find-your-reasons`,
    { useNewUrlParser: true }
  )
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Session Settings

app.use(
  session({
    secret: "Im not a rabbit",
    resave: true,
    saveUninitialized: true
  })
);

//Use passport

app.use(passport.initialize());
app.use(passport.session());

// Cors settings

app.use(
  /*  "*", */
  cors({
    credentials: true,
    origin: ["http://localhost:3000"]
  })
);

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

const index = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const appRoutes = require("./routes/appRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/", index);
app.use("/auth", authRoutes);
app.use("/app", appRoutes);
app.use("/user", userRoutes);

module.exports = app;
