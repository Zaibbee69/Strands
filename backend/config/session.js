const session = require("express-session");

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

module.exports = sessionMiddleware;