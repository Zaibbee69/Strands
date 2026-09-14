const prisma = require("../prisma/prismaClient");

async function getUser(req, res, next) {
    try {
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
                _count: {
                    select: { followers: true, following: true, posts: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
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

        const follow = await prisma.follow.upsert({
            where: { followerId_followingId: { followerId, followingId } },
            update: {}, // already exists (PENDING or ACCEPTED) — no-op, idempotent
            create: { followerId, followingId, status: "PENDING" },
        });

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

        return res.status(200).json({ status: null });
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
};


