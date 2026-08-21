const passport = require("passport");

require("./passport-local")(passport);
require("./passport-github")(passport);
require("./passport-session")(passport);

module.exports = passport;