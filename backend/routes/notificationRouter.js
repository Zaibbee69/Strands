const { Router } = require("express");
const {
    listNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notificationController");
const notificationRouter = Router();

notificationRouter.get("/", listNotifications);
notificationRouter.get("/unread-count", getUnreadCount); // above "/:id" to avoid collision
notificationRouter.patch("/read-all", markAllAsRead);     // same
notificationRouter.patch("/:id/read", markAsRead);

module.exports = notificationRouter;