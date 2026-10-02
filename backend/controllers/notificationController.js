const prisma = require("../prisma/prismaClient");

async function listNotifications(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where: { recipientId: currentUserId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit + 1,
            include: {
                actor: { select: { id: true, username: true, avatarUrl: true } },
                post: { select: { id: true, content: true } },
                comment: { select: { id: true, content: true, postId: true } },
            },
        });

        const hasMore = notifications.length > limit;
        const pageNotifications = hasMore ? notifications.slice(0, limit) : notifications;

        return res.status(200).json({ notifications: pageNotifications, hasMore, page });
    } catch (err) {
        next(err);
    }
}

async function getUnreadCount(req, res, next) {
    try {
        const count = await prisma.notification.count({
            where: { recipientId: req.user.id, read: false },
        });
        return res.status(200).json({ count });
    } catch (err) {
        next(err);
    }
}

async function markAsRead(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const notificationId = req.params.id;

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.recipientId !== currentUserId) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });

        return res.status(200).json({ message: "Marked as read" });
    } catch (err) {
        next(err);
    }
}

async function markAllAsRead(req, res, next) {
    try {
        await prisma.notification.updateMany({
            where: { recipientId: req.user.id, read: false },
            data: { read: true },
        });
        return res.status(200).json({ message: "All marked as read" });
    } catch (err) {
        next(err);
    }
}

module.exports = { listNotifications, getUnreadCount, markAsRead, markAllAsRead };