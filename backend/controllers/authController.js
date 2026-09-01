const bcrypt = require("bcryptjs");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");
const { generateGuestProfile } = require("../middlewares/generateGuestProfile");

async function signup(req, res, next) {
    try {
        const { username, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { username, passwordHash, authProvider: "LOCAL" }
        });

        req.login(user, (err) => {
            if (err) return next(err);
            return res.status(201).json({ message: "Registration successful", user: { id: user.id, username: user.username } });
        });
    } catch (err) {
        next(err);
    }
}

function localLogin(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.status(200).json({ message: "Login successful", user: { id: user.id, username: user.username } });
        });
    })(req, res, next);
}

function githubLogin(req, res, next) {
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
}

function githubCallback(req, res, next) {
    passport.authenticate("github", (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_failed`);
        }

        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            // Full redirect back into your React app — session cookie is already set
            return res.redirect(`${process.env.FRONTEND_URL}/`);
        });
    })(req, res, next);
}

async function guestLogin(req, res, next) {

    const { username, bio } = generateGuestProfile();

    try {
        const guest = await prisma.user.create({
            data: {
                username: username,
                bio: bio,
                isGuest: true,
                authProvider: "GUEST",
            },
        });

        req.login(guest, (err) => {
            if (err) return next(err);
            return res.status(201).json({ message: "Guest session started", user: { id: guest.id, username: guest.username } });
        });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((destroyErr) => {
            if (destroyErr) return next(destroyErr);
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "Logged out successfully" });
        });
    });
}

function getStatus(req, res) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.status(200).json({ user: req.user });
    }
    return res.status(200).json({ user: null });
}

module.exports = { signup, localLogin, githubLogin, githubCallback, guestLogin, logout, getStatus };
