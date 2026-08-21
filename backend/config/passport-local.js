const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("../prisma/prismaClient")

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: "username", passwordField: "password" },
            async (username, password, done) => {
                try {
                    const user = await prisma.user.findUnique({ where: { username } });

                    if (!user) {
                        return done(null, false, { message: "Incorrect username." });
                    }

                    // Guest / GitHub-only users won't have a passwordHash
                    if (!user.passwordHash) {
                        return done(null, false, {
                            message: "This account doesn't use password login.",
                        });
                    }

                    const isMatch = await bcrypt.compare(password, user.passwordHash);
                    if (!isMatch) {
                        return done(null, false, { message: "Incorrect password." });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
};
