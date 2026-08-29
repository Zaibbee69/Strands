const { Router } = require("express")
const { getUser } = require("../controllers/userController")
const userRouter = Router()


userRouter.get("/:id", getUser)

module.exports = userRouter