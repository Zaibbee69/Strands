const { Router } = require("express");
const { getUploadSignature } = require("../controllers/uploadController");
const uploadRouter = Router();

uploadRouter.get("/signature", getUploadSignature);

module.exports = uploadRouter;