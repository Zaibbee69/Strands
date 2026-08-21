const GitHubStrategy = require("passport-github2").Strategy;
const prisma = require("../prisma/prismaClient");

module.exports = function (passport) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g. http://localhost:3000/auth/github/callback
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if this GitHub account is already linked
                    let user = await prisma.user.findUnique({
                        where: { githubId: profile.id },
                    });

                    if (!user) {
                        // Create a new user from GitHub profile data
                        user = await prisma.user.create({
                            data: {
                                username: profile.username || `gh_${profile.id}`,
                                githubId: profile.id,
                                avatarUrl: profile.photos?.[0]?.value || null,
                                authProvider: "GITHUB",
                                email: profile.emails?.[0]?.value || null,
                            },
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );
};