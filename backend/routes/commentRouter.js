const { Router } = require("express");
const { deleteComment } = require("../controllers/commentController");
const commentRouter = Router();

commentRouter.delete("/:id", deleteComment);

module.exports = commentRouter;