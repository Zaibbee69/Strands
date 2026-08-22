function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "You must be signed in to access this resource" });
}

module.exports = ensureAuthenticated;