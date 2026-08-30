const { Router } = require("express")
const { getUser, updateUser, deleteUser } = require("../controllers/userController")
const userRouter = Router()


userRouter.get("/:id", getUser)
userRouter.put("/:id", updateUser)
userRouter.delete("/:id", deleteUser)

module.exports = userRouter