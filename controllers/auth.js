const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/jwtConfig");
// const db = require("../models");

module.exports = {
  google: {
    get: (req, res, next) => {
      passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false
      })(req, res, next);
    },
    callback: {
      get: (req, res, next) => {
        console.log("/auth/google/callback!!!!!!!!!!!!!!!!!!!!!!!");
        passport.authenticate(
          "google",
          {
            session: false
          },
          (err, email, info) => {
            if (email) {
              let userData = {
                isUser: false,
                message: "Don't have user!",
                google_id: email.id,
                email: email.emails[0].value,
                name: email.displayName,
                provider: email.provider,
                image: email.photos[0].value
              };
              res.status(200).send(userData);
            } else {
              const token = jwt.sign(
                {
                  email: email.emails[0].value,
                  name: email.displayName,
                  image: email.photos[0].value
                },
                jwtSecret.secret
              );
              res.status(200).send({
                isUser: true,
                token: token
              });
            }
          }
        )(req, res, next);
      }
    }
  },
  facebook: {
    get: (req, res) => {
      res.status(201).send("GET users/facebook OK!");
    }
  },
  check: {
    get: (req, res, next) => {
      passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) {
          console.log("ERROR /users/info : ", err);
        }
        if (info !== undefined) {
          let responseData = {
            success: false,
            message: info.message
          };
          res.status(200).send(responseData);
        } else {
          res.status(200).send(user);
        }
      })(req, res, next);
    }
  }
};

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// // GET /auth/google/callback
// //   Use passport.authenticate() as route middleware to authenticate the
// //   request.  If authentication fails, the user will be redirected back to the
// //   login page.  Otherwise, the primary route function function will be called,
// //   which, in this example, will redirect the user to the home page.
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });
