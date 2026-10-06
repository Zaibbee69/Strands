const { Server } = require("socket.io");
const sessionMiddleware = require("../config/session");
const prisma = require("../prisma/prismaClient");

// Lets an Express-style middleware run inside Socket.IO's handshake pipeline —
// the standard pattern for sharing express-session with Socket.IO.
function wrap(middleware) {
    return (socket, next) => middleware(socket.request, {}, next);
}

function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    io.use(wrap(sessionMiddleware));

    // Resolve the authenticated user directly from the session, rather than
    // also wrapping passport.initialize()/passport.session() — Passport's
    // deserializeUser here is just "look up by id", so we do that lookup
    // ourselves to keep the socket middleware simple.
    io.use(async (socket, next) => {
        const userId = socket.request.session?.passport?.user;
        if (!userId) {
            return next(new Error("Unauthorized"));
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, avatarUrl: true },
        });

        if (!user) {
            return next(new Error("Unauthorized"));
        }

        socket.user = user;
        next();
    });

    io.on("connection", (socket) => {
        const userId = socket.user.id;

        // Every user gets a private room keyed to their own id. This is how
        // we target "deliver this event to user X" regardless of how many
        // tabs/devices they currently have open.
        socket.join(`user:${userId}`);

        socket.on("send_message", async (payload, callback) => {
            try {
                const { recipientId, content } = payload || {};

                if (!recipientId || !content || !content.trim()) {
                    return callback?.({ error: "recipientId and content are required" });
                }
                if (recipientId === userId) {
                    return callback?.({ error: "You cannot message yourself" });
                }
                if (content.length > 2000) {
                    return callback?.({ error: "Message is too long" });
                }

                const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
                if (!recipient) {
                    return callback?.({ error: "Recipient not found" });
                }

                const message = await prisma.message.create({
                    data: {
                        content: content.trim(),
                        senderId: userId,
                        recipientId,
                    },
                    include: {
                        sender: { select: { id: true, username: true, avatarUrl: true } },
                    },
                });

                try {
                    await prisma.notification.create({
                        data: {
                            type: "MESSAGE",
                            recipientId,
                            actorId: userId,
                        },
                    });
                } catch (notifErr) {
                    console.error("Failed to create notification:", notifErr);
                }

                // Push to both participants so every open tab/device for
                // each of them updates instantly.
                io.to(`user:${recipientId}`).to(`user:${userId}`).emit("new_message", message);

                callback?.({ message });
            } catch (err) {
                console.error("send_message error:", err);
                callback?.({ error: "Failed to send message" });
            }
        });
    });

    return io;
}

module.exports = initSocket;