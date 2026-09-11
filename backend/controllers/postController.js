const prisma = require("../prisma/prismaClient");

async function getPosts(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const { authorId } = req.query;
        const feed = req.query.feed === "following" ? "following" : "recent";
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const skip = (page - 1) * limit;

        let where = {};

        if (authorId) {
            // Profile page mode — ignore feed param entirely, just this user's posts
            where = { authorId };
        } else if (feed === "following") {
            const following = await prisma.follow.findMany({
                where: { followerId: currentUserId, status: "ACCEPTED" },
                select: { followingId: true },
            });
            const followingIds = following.map((f) => f.followingId);

            if (followingIds.length === 0) {
                return res.status(200).json({ posts: [], hasMore: false, page });
            }

            where = { authorId: { in: followingIds } };
        }

        const posts = await prisma.post.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit + 1,
            include: {
                author: { select: { id: true, username: true, avatarUrl: true } },
                votes: { select: { userId: true, type: true } },
                _count: { select: { comments: true } },
            },
        });

        const hasMore = posts.length > limit;
        const pagePosts = hasMore ? posts.slice(0, limit) : posts;

        const formatted = pagePosts.map((post) => {
            const likeCount = post.votes.filter((v) => v.type === "LIKE").length;
            const dislikeCount = post.votes.filter((v) => v.type === "DISLIKE").length;
            const userVoteEntry = post.votes.find((v) => v.userId === currentUserId);

            return {
                id: post.id,
                content: post.content,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                author: post.author,
                score: likeCount - dislikeCount,
                commentCount: post._count.comments,
                userVote: userVoteEntry ? userVoteEntry.type : null,
            };
        });

        return res.status(200).json({ posts: formatted, hasMore, page });
    } catch (err) {
        next(err);
    }
}

async function createPost(req, res, next) {
    try {
        const authorId = req.user.id;
        const { content, imageUrl } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Post content cannot be empty" });
        }

        if (content.length > 2000) {
            return res.status(400).json({ message: "Post content is too long" });
        }

        const post = await prisma.post.create({
            data: {
                content: content.trim(),
                imageUrl: imageUrl || null,
                authorId,
            },
            include: {
                author: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        return res.status(201).json({
            message: "Post created successfully",
            post: {
                id: post.id,
                content: post.content,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                author: post.author,
                score: 0,
                commentCount: 0,
                userVote: null,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getPosts, createPost };