const cloudinary = require("../lib/cloudinary");

function getUploadSignature(req, res, next) {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = "strand/posts";

        // Only params listed here are covered by the signature —
        // the frontend must send these exact same values back to Cloudinary.
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET
        );

        return res.status(200).json({
            signature,
            timestamp,
            folder,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getUploadSignature };