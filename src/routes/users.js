const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware.js");
const cookie = require("cookie");

// Passport Configuration
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Email not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// // // Handle Login
// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/users/success",
//     failureRedirect: "/users/fail",
//     failureFlash: true,
//   })
// );

// // Login Form successs route
// router.get("/success", (req, res) => {
//   const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });

//   // Set the JWT token in an HttpOnly cookie
//   const tokenCookie = cookie.serialize("jwt", token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "strict",
//     maxAge: 3600,
//     path: "/",
//   });

//   res.setHeader("Set-Cookie", tokenCookie);
//   res.status(200).json({ msg: "done succesfully" });
// });

// //login form fail route
// router.get("/fail", (req, res) => {
//   res.status(201).json({ msg: "fail" });
// });

// Define a function to generate a JWT token
function generateJwtToken(user) {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}
// Handle Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return loginFailed(res);
    }
    const token = generateJwtToken(user);
    loginSuccess(res, user, token);
  })(req, res, next);
});

// Define a function to handle successful login
function loginSuccess(res, user, token) {
  const response = {
    message: "Authentication successful",
    user: {
      _id: user._id,
      email: user.email,
    },
  };
  // Set the JWT token in an HttpOnly cookie
  const tokenCookie = cookie.serialize("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  });

  const loginCookie = cookie.serialize("login", true, {
    secure: true,
    maxAge: 3600,
    path: "/",
  });

  res.setHeader("Set-Cookie", tokenCookie);
  res.setHeader("Set-Cookie", loginCookie);
  res.status(200).json(response);
}

// Define a function to handle login failure
function loginFailed(res) {
  res.status(401).json({ message: "Authentication failed" });
}

async function sendMail(email) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Subject of your email",
    text: "Hello, this is the plain text message.",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

// Handle Registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(201).json({ msg: "Email already registered" });
  } else {
    const newUser = new User({ email, password });
    newUser
      .save()
      .then(() => {
        res.status(200).json({ msg: "done" });
      })
      .catch((err) => console.log(err));
    // send email on new user registration
    sendMail(email);
  }
});

//user data
router.get("/details", protect, async (req, res) => {
  // Parse the JWT token from the cookie
  if (!req.user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json({
    _id: req.user._id,
    email: req.user.email,
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({ msg: "done logout" });
  });
});

module.exports = router;
