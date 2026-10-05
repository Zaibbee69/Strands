const { Router } = require("express");
const { getPosts, createPost, getPost } = require("../controllers/postController");
const { castVote } = require("../controllers/voteController");
const { listComments, createComment } = require("../controllers/commentController");
const postRouter = Router();

postRouter.get("/", getPosts);
postRouter.post("/", createPost);
postRouter.get("/:id", getPost);
postRouter.post("/:id/vote", castVote);
postRouter.get("/:postId/comments", listComments);
postRouter.post("/:postId/comments", createComment);

module.exports = postRouter;