const { Router } = require("express");
const {
    listFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
} = require("../controllers/followController");
const followRequestRouter = Router();

followRequestRouter.get("/", listFollowRequests);
followRequestRouter.patch("/:followerId/accept", acceptFollowRequest);
followRequestRouter.delete("/:followerId/reject", rejectFollowRequest);

module.exports = followRequestRouter;