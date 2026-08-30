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

async function deleteUser(req, res) {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId !== currentUserId) {
        return res.status(403).json({
            message: "Unauthorized. You can only delete your own profile."
        });
    }

    await prisma.$transaction([
        prisma.post.deleteMany({ where: { authorId: targetUserId } }),

        prisma.follow.deleteMany({
            where: { OR: [{ followerId: targetUserId }, { followingId: targetUserId }] }
        }),

        prisma.user.delete({ where: { id: targetUserId } })
    ]);

    return res.status(200).json({ message: "User deleted successfully!" });
}


module.exports = { getUser, updateUser, deleteUser };