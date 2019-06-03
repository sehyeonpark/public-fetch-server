const BCRIPT_SALT_ROUNDS = 12;
const jwtSecret = require("../config/jwtConfig");
const db = require("../models");
const bcrypt = require("bcrypt");
const passport = require("passport"),
  localStrategy = require("passport-local").Strategy,
  JWTstrategy = require("passport-jwt").Strategy,
  ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  "register",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
      session: false
    },
    (req, email, password, done) => {
      try {
        db.users
          .findOne({
            where: {
              email: email
            }
          })
          .then(user => {
            if (user !== null) {
              return done(null, false, { message: "This user is already!" });
            } else {
              bcrypt.hash(password, BCRIPT_SALT_ROUNDS).then(hashedPassword => {
                db.users
                  .create({
                    email: email,
                    password: hashedPassword,
                    name: req.body.name,
                    provider: "fetcher"
                  })
                  .then(user => {
                    return done(null, user);
                  });
              });
            }
          });
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false
    },
    (email, password, done) => {
      try {
        db.users
          .findOne({
            where: {
              email: email
            }
          })
          .then(user => {
            if (user === null) {
              return done(null, false, { message: "bad email" });
            } else {
              bcrypt.compare(password, user.password).then(response => {
                if (response !== true) {
                  return done(null, false, {
                    message: "Passwords do not match!"
                  });
                }
                return done(null, user);
              });
            }
          });
      } catch (err) {
        done(err);
      }
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
  secretOrKey: jwtSecret.secret
};
passport.use(
  "jwt",
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      db.users
        .findOne({
          where: {
            email: jwt_payload.email
          }
        })
        .then(user => {
          if (user) {
            done(null, user);
          } else {
            done(null, false, { message: "User not found in DB!" });
          }
        });
    } catch (err) {
      done(err);
    }
  })
);