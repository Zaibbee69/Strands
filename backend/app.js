require('dotenv').config();
const path = require("node:path");
const express = require('express');
const cors = require('cors');
const session = require("express-session")
const passport = require("./config/passport")

// Middleware
const globalErrorHandler = require("./middlewares/globalErrorHandler");

// Routes
const authRouter = require("./routes/authRouter")

// App Configurations
const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRouter)

// --- GLOBAL ERROR HANDLER ---
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is running and listening on port http://localhost:${PORT}`);
})