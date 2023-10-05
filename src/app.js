const dotenv = require("dotenv");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

// Middleware
// app.use(cors);
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.use("/api/users", require("./routes/users"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
