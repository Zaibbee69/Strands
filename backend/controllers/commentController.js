const prisma = require("../prisma/prismaClient");

async function listComments(req, res, next) {
    try {
        const { postId } = req.params;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
        const skip = (page - 1) * limit;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "asc" },
            skip,
            take: limit + 1,
            include: {
                author: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        const hasMore = comments.length > limit;
        const pageComments = hasMore ? comments.slice(0, limit) : comments;

        return res.status(200).json({ comments: pageComments, hasMore, page });
    } catch (err) {
        next(err);
    }
}

async function createComment(req, res, next) {
    try {
        const authorId = req.user.id;
        const { postId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }
        if (content.length > 1000) {
            return res.status(400).json({ message: "Comment is too long" });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = await prisma.comment.create({
            data: { content: content.trim(), postId, authorId },
            include: { author: { select: { id: true, username: true, avatarUrl: true } } },
        });

        if (post.authorId !== authorId) {
            try {
                await prisma.notification.create({
                    data: {
                        type: "COMMENT",
                        recipientId: post.authorId,
                        actorId: authorId,
                        postId: post.id,
                        commentId: comment.id,
                    },
                });
            } catch (notifErr) {
                console.error("Failed to create notification:", notifErr);
            }
        }

        return res.status(201).json({ comment });
    } catch (err) {
        next(err);
    }
}

async function deleteComment(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const { id } = req.params;

        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.authorId !== currentUserId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        await prisma.comment.delete({ where: { id } });
        return res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
        next(err);
    }
}

module.exports = { listComments, createComment, deleteComment };