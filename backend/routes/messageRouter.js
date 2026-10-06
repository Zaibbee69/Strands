const { Router } = require("express");
const {
    listConversations,
    getMessageHistory,
    markConversationRead,
} = require("../controllers/messageController");
const messageRouter = Router();

messageRouter.get("/conversations", listConversations); // must sit above "/:userId"
messageRouter.get("/:userId", getMessageHistory);
messageRouter.patch("/:userId/read", markConversationRead);

module.exports = messageRouter;