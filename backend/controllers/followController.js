const prisma = require("../prisma/prismaClient");

// GET /follow-requests — pending requests sent TO the current user
async function listFollowRequests(req, res, next) {
    try {
        const currentUserId = req.user.id;

        const requests = await prisma.follow.findMany({
            where: { followingId: currentUserId, status: "PENDING" },
            orderBy: { createdAt: "desc" },
            include: {
                follower: {
                    select: { id: true, username: true, avatarUrl: true, bio: true },
                },
            },
        });

        const formatted = requests.map((r) => ({
            id: r.id,
            createdAt: r.createdAt,
            follower: r.follower,
        }));

        return res.status(200).json({ requests: formatted });
    } catch (err) {
        next(err);
    }
}

// PATCH /follow-requests/:followerId/accept
async function acceptFollowRequest(req, res, next) {
    try {
        const followingId = req.user.id; // me, the recipient
        const followerId = req.params.followerId;

        const existing = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });

        if (!existing || existing.status !== "PENDING") {
            return res.status(404).json({ message: "No pending request from this user" });
        }

        const updated = await prisma.follow.update({
            where: { followerId_followingId: { followerId, followingId } },
            data: { status: "ACCEPTED" },
        });

        try {
            await prisma.notification.create({
                data: {
                    type: "FOLLOW_ACCEPTED",
                    recipientId: followerId, // the original requester gets notified
                    actorId: followingId,
                },
            });
        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
        }

        return res.status(200).json({ status: updated.status });
    } catch (err) {
        next(err);
    }
}

// DELETE /follow-requests/:followerId/reject
async function rejectFollowRequest(req, res, next) {
    try {
        const followingId = req.user.id;
        const followerId = req.params.followerId;

        await prisma.follow.deleteMany({
            where: { followerId, followingId, status: "PENDING" },
        });

        return res.status(200).json({ status: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { listFollowRequests, acceptFollowRequest, rejectFollowRequest };