const bcrypt = require("bcryptjs");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

async function signup(req, res, next) {

    const { username, password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: { username, passwordHash, authProvider: "LOCAL" }
    })

    req.login(user, (err) => {
        if (err) return next(err)
        res.redirect("/")
    })
}

function localLogin() {
    passport.authenticate("local", { successRedirect: "/", failureRedirect: "/login" })
}

function githubLogin() {
    passport.authenticate("github", { scope: ["user:email"] })
}

function githubCallback() {
    passport.authenticate("github", { failureRedirect: "/login" }),
        (req, res) => res.redirect("/")
}

async function guestLogin(req, res, next) {
    const guest = await prisma.user.create({
        data: {
            username: `guest_${Date.now()}`,
            isGuest: true,
            authProvider: "GUEST",
        },
    })

    req.login(guest, (err) => {
        if (err) return next(err);
        res.redirect("/");
    });
}

async function logout(req, res, next) {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/login");
    });
}

module.exports = { signup, localLogin, githubLogin, githubCallback, guestLogin, logout }