const prisma = require("../prisma/prismaClient");

async function getUser(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const userId = req.params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                bio: true,
                isGuest: true,
                createdAt: true,
                // Follow row (if any) where the viewer is the follower
                followers: {
                    where: { followerId: currentUserId },
                    select: { status: true },
                },
                _count: {
                    select: {
                        followers: { where: { status: "ACCEPTED" } },
                        following: { where: { status: "ACCEPTED" } },
                        posts: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { followers, ...rest } = user;
        return res.status(200).json({
            ...rest,
            followStatus: followers[0]?.status ?? null, // null | "PENDING" | "ACCEPTED"
        });
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const targetUserId = req.params.id;
        const authenticatedUserId = req.user.id;

        if (targetUserId !== authenticatedUserId) {
            return res.status(403).json({
                message: "Unauthorized. You can only edit your own profile."
            });
        }

        const { bio, avatarUrl } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { bio, avatarUrl },
            select: { id: true, bio: true, avatarUrl: true }
        });

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({ message: "Username already taken" });
        }
        if (err.code === "P2025") {
            return res.status(404).json({ message: "User not found" });
        }
        next(err);
    }
}

async function listUsers(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const search = req.query.search?.trim() || "";
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
        const skip = (page - 1) * limit;

        const where = {
            id: { not: currentUserId },
            ...(search
                ? { username: { contains: search, mode: "insensitive" } }
                : {}),
        };

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit + 1,
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                bio: true,
                isGuest: true,
                // Follow records where THIS user is the target and currentUser is the follower
                followers: {
                    where: { followerId: currentUserId },
                    select: { status: true },
                },
            },
        });

        const hasMore = users.length > limit;
        const pageUsers = hasMore ? users.slice(0, limit) : users;

        const formatted = pageUsers.map((u) => ({
            id: u.id,
            username: u.username,
            avatarUrl: u.avatarUrl,
            bio: u.bio,
            isGuest: u.isGuest,
            // null = not followed, "PENDING" = request sent, "ACCEPTED" = following
            followStatus: u.followers[0]?.status ?? null,
        }));

        return res.status(200).json({ users: formatted, hasMore, page });
    } catch (err) {
        next(err);
    }
}

async function followUser(req, res, next) {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        if (followerId === followingId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });

        const follow = await prisma.follow.upsert({
            where: { followerId_followingId: { followerId, followingId } },
            update: {},
            create: { followerId, followingId, status: "PENDING" },
        });

        if (!existing) {
            try {
                await prisma.notification.create({
                    data: {
                        type: "FOLLOW_REQUEST",
                        recipientId: followingId,
                        actorId: followerId,
                    },
                });
            } catch (notifErr) {
                console.error("Failed to create notification:", notifErr);
            }
        }

        return res.status(201).json({ status: follow.status });
    } catch (err) {
        next(err);
    }
}

async function unfollowUser(req, res, next) {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        await prisma.follow.deleteMany({ where: { followerId, followingId } });

        // Retract the request notification so it doesn't linger after a cancel
        await prisma.notification.deleteMany({
            where: {
                type: "FOLLOW_REQUEST",
                actorId: followerId,
                recipientId: followingId,
            },
        });

        return res.status(200).json({ status: null });
    } catch (err) {
        next(err);
    }
}

// Shared by both widget endpoints
function parseLimit(raw) {
    return Math.min(Math.max(parseInt(raw) || 5, 1), 20);
}

function widgetSelect(currentUserId) {
    return {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        // Follow row (if any) where the current user is the follower
        followers: {
            where: { followerId: currentUserId },
            select: { status: true },
        },
        // Only ACCEPTED follows count as real followers
        _count: { select: { followers: { where: { status: "ACCEPTED" } } } },
    };
}

function formatWidgetUser(u) {
    return {
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        followerCount: u._count.followers,
        followStatus: u.followers[0]?.status ?? null, // null | "PENDING" | "ACCEPTED"
    };
}

async function getLatestUsers(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const limit = parseLimit(req.query.limit);

        const users = await prisma.user.findMany({
            where: { id: { not: currentUserId }, isGuest: false },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: widgetSelect(currentUserId),
        });

        return res.status(200).json({ users: users.map(formatWidgetUser) });
    } catch (err) {
        next(err);
    }
}

async function getMostFollowedUsers(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const limit = parseLimit(req.query.limit);

        // Prisma can't order by a *filtered* relation count, so rank with groupBy
        // on the Follow table (ACCEPTED only), then load the user details.
        const ranked = await prisma.follow.groupBy({
            by: ["followingId"],
            where: {
                status: "ACCEPTED",
                followingId: { not: currentUserId },
                following: { isGuest: false },
            },
            _count: { followingId: true },
            orderBy: { _count: { followingId: "desc" } },
            take: limit,
        });

        const ids = ranked.map((r) => r.followingId);
        if (ids.length === 0) {
            return res.status(200).json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: { id: { in: ids } },
            select: widgetSelect(currentUserId),
        });

        // findMany doesn't preserve the ranking, so restore it
        const byId = new Map(users.map((u) => [u.id, u]));
        const ordered = ids
            .map((id) => byId.get(id))
            .filter(Boolean)
            .map(formatWidgetUser);

        return res.status(200).json({ users: ordered });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUser,
    updateUser,
    listUsers,
    followUser,
    unfollowUser,
    getLatestUsers,
    getMostFollowedUsers,
};



