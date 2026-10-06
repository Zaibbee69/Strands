require('dotenv').config();
const path = require("node:path");
const http = require("node:http");
const express = require('express');
const cors = require('cors');
const sessionMiddleware = require("./config/session");
const initSocket = require("./socket");
const passport = require("./config/passport")



// Middleware
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const ensureAuthenticated = require("./middlewares/ensureAuthenticated")

// Routes
const authRouter = require("./routes/authRouter")
const userRouter = require("./routes/userRouter")
const postRouter = require("./routes/postRouter")
const uploadRouter = require("./routes/uploadRouter")
const followRequestRouter = require("./routes/followRequestRouter");
const notificationRouter = require("./routes/notificationRouter");
const commentRouter = require("./routes/commentRouter");
const messageRouter = require("./routes/messageRouter");



// App Configurations
const app = express();
const PORT = process.env.PORT;


app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());



// Routes
app.use("/auth", authRouter)
app.use(ensureAuthenticated)
app.use("/users", userRouter)
app.use("/posts", postRouter)
app.use("/uploads", uploadRouter)
app.use("/follow-requests", followRequestRouter);
app.use("/notifications", notificationRouter);
app.use("/messages", messageRouter);
app.use("/comments", commentRouter);


// --- GLOBAL ERROR HANDLER ---
app.use(globalErrorHandler);

// app.listen(PORT, () => {
//     console.log(`Server is running and listening on port http://localhost:${PORT}`);
// })


const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running and listening on port http://localhost:${PORT}`);
});
