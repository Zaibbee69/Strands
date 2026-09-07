const { Router } = require("express");
const { getPosts, createPost } = require("../controllers/postController");
const { castVote } = require("../controllers/voteController");
const postRouter = Router();

postRouter.get("/", getPosts);
postRouter.post("/", createPost);
postRouter.post("/:id/vote", castVote);

module.exports = postRouter;