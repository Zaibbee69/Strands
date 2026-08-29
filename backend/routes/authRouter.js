const { Router } = require("express")
const { signup, localLogin, githubLogin, githubCallback, guestLogin, logout, getStatus } = require("../controllers/authController")
const authRouter = Router();

authRouter.post("/signup", signup)
authRouter.post("/login", localLogin)
authRouter.get("/github", githubLogin)
authRouter.get("/github/callback", githubCallback)
authRouter.post("/guest", guestLogin)
authRouter.post("/logout", logout)
authRouter.get("/status", getStatus)


module.exports = authRouter