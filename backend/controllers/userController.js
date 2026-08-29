const prisma = require("../prisma/prismaClient");

async function getUser(req, res) {
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
                select: {
                    followers: true,
                    following: true,
                    posts: true
                }
            }
        }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
}

module.exports = { getUser };
