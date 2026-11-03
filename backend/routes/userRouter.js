const { Router } = require("express");
const {
    getUser,
    updateUser,
    listUsers,
    followUser,
    unfollowUser,
    getLatestUsers,
    getMostFollowedUsers,
} = require("../controllers/userController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const userRouter = Router();

userRouter.get("/", listUsers);              // must come before "/:id"
userRouter.get("/latest", getLatestUsers);              // above "/:id"
userRouter.get("/most-followed", getMostFollowedUsers); // above "/:id"
userRouter.get("/:id", getUser);
userRouter.put("/:id", ensureAuthenticated, updateUser);
userRouter.post("/:id/follow", followUser);
userRouter.delete("/:id/follow", unfollowUser);

module.exports = userRouter;
