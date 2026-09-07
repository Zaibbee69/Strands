const prisma = require("../prisma/prismaClient");

async function castVote(req, res, next) {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const { type } = req.body; // "LIKE" | "DISLIKE" | null

        if (type !== "LIKE" && type !== "DISLIKE" && type !== null) {
            return res.status(400).json({ message: "type must be LIKE, DISLIKE, or null" });
        }

        // Make sure the post actually exists before touching votes
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (type === null) {
            // Clearing a vote — delete if it exists, no-op if it doesn't
            await prisma.vote.deleteMany({
                where: { userId, postId },
            });
        } else {
            // Create a new vote, or flip the type of an existing one
            await prisma.vote.upsert({
                where: { userId_postId: { userId, postId } },
                update: { type },
                create: { userId, postId, type },
            });
        }

        // Recompute the real score + comment count from the DB (source of truth,
        // not trusted from the client) so the frontend can resync if it drifted
        const votes = await prisma.vote.findMany({ where: { postId } });
        const likeCount = votes.filter((v) => v.type === "LIKE").length;
        const dislikeCount = votes.filter((v) => v.type === "DISLIKE").length;

        return res.status(200).json({
            score: likeCount - dislikeCount,
            userVote: type,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { castVote };