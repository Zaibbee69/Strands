const prisma = require("../prisma/prismaClient");

async function listConversations(req, res, next) {
    try {
        const currentUserId = req.user.id;

        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: currentUserId }, { recipientId: currentUserId }],
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
                recipient: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherUser = msg.senderId === currentUserId ? msg.recipient : msg.sender;

            if (!conversationMap.has(otherUser.id)) {
                conversationMap.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: {
                        content: msg.content,
                        createdAt: msg.createdAt,
                        isMine: msg.senderId === currentUserId,
                    },
                    unreadCount: 0,
                });
            }

            if (msg.recipientId === currentUserId && !msg.read) {
                conversationMap.get(otherUser.id).unreadCount += 1;
            }
        }

        const conversations = Array.from(conversationMap.values()).sort(
            (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );

        return res.status(200).json({ conversations });
    } catch (err) {
        next(err);
    }
}

async function getMessageHistory(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 30, 1), 100);
        const skip = (page - 1) * limit;

        const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, recipientId: otherUserId },
                    { senderId: otherUserId, recipientId: currentUserId },
                ],
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit + 1,
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        const hasMore = messages.length > limit;
        // Reversed so the page renders oldest-first, like a normal chat log
        const pageMessages = (hasMore ? messages.slice(0, limit) : messages).reverse();

        return res.status(200).json({ messages: pageMessages, hasMore, page });
    } catch (err) {
        next(err);
    }
}

async function markConversationRead(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        await prisma.message.updateMany({
            where: { senderId: otherUserId, recipientId: currentUserId, read: false },
            data: { read: true },
        });

        return res.status(200).json({ message: "Marked as read" });
    } catch (err) {
        next(err);
    }
}

module.exports = { listConversations, getMessageHistory, markConversationRead };