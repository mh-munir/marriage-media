const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const PORT = Number(process.env.SOCKET_PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required for the socket server");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required for the socket server");
}

const MessageSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const ConversationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString();
}

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
}

function getToken(socket) {
  const authToken = socket.handshake.auth && socket.handshake.auth.token;
  if (typeof authToken === "string" && authToken) return authToken;

  const header = socket.handshake.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  const cookie = socket.handshake.headers.cookie || "";
  const tokenCookie = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : "";
}

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(404);
  response.end();
});

const io = new Server(server, {
  cors: {
    origin: APP_ORIGIN,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = getToken(socket);
    const payload = jwt.verify(token, JWT_SECRET);
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    await connectMongo();
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);
  socket.broadcast.emit("user-online", { userId });

  socket.on("join", (requestedUserId) => {
    if (requestedUserId === userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on("typing", ({ conversationId, receiverId, isTyping }) => {
    if (receiverId) {
      socket.to(`user:${receiverId}`).emit("typing", { conversationId, userId, isTyping });
      return;
    }
    socket.broadcast.emit("typing", { conversationId, userId, isTyping });
  });

  socket.on("send-message", async (payload) => {
    try {
      const senderId = normalizeId(payload.senderId) || userId;
      const receiverId = normalizeId(payload.receiverId);
      const conversationId = normalizeId(payload.conversationId);

      if (senderId !== userId || !isObjectId(receiverId) || !isObjectId(conversationId)) {
        return;
      }

      let message = payload;
      const messageId = normalizeId(payload.id || payload._id);

      if (!isObjectId(messageId)) {
        const created = await Message.create({
          conversationId,
          senderId,
          receiverId,
          content: payload.content || "",
          messageType: payload.messageType || payload.type || "text",
          fileUrl: payload.fileUrl || "",
          fileName: payload.fileName || "",
          fileSize: payload.fileSize || 0,
          mimeType: payload.mimeType || "",
          thumbnailUrl: payload.thumbnailUrl || "",
          voiceUrl: payload.voiceUrl || "",
          voiceDuration: payload.voiceDuration || 0,
          replyTo: payload.replyTo || undefined,
          replyPreview: payload.replyPreview,
          isRead: false,
          isDelivered: false,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: created._id,
          lastMessagePreview: created.content.substring(0, 100),
          lastMessageType: created.messageType,
          lastMessageAt: new Date(),
          $inc: { "participantInfo.$[receiver].unreadCount": 1 },
        }, {
          arrayFilters: [{ "receiver.userId": receiverId }],
        });

        message = {
          id: created._id.toString(),
          conversationId,
          senderId,
          receiverId,
          content: created.content,
          messageType: created.messageType,
          isRead: created.isRead,
          isDelivered: created.isDelivered,
          createdAt: created.createdAt,
        };
      }

      socket.to(`user:${receiverId}`).emit("new-message", message);
    } catch (error) {
      socket.emit("message-error", {
        message: error instanceof Error ? error.message : "Failed to send message",
      });
    }
  });

  socket.on("message-delivered", async ({ messageId, conversationId, receiverId }) => {
    if (isObjectId(messageId)) {
      await Message.findByIdAndUpdate(messageId, {
        isDelivered: true,
        deliveredAt: new Date(),
      });
    }

    if (receiverId) {
      socket.to(`user:${receiverId}`).emit("message-delivered", { messageId, conversationId });
    }
  });

  socket.on("add-reaction", async ({ conversationId, messageId, reaction }) => {
    if (!isObjectId(messageId)) return;

    const emoji = reaction && reaction.emoji;
    if (typeof emoji !== "string" || !emoji) return;

    await Message.findByIdAndUpdate(messageId, {
      $pull: { reactions: { userId } },
    });
    await Message.findByIdAndUpdate(messageId, {
      $push: { reactions: { userId, emoji, createdAt: new Date() } },
    });

    socket.broadcast.emit("reaction-added", {
      conversationId,
      messageId,
      reaction: { userId, emoji },
    });
  });

  socket.on("delete-message", async ({ conversationId, messageId }) => {
    if (!isObjectId(messageId)) return;

    await Message.findOneAndUpdate(
      { _id: messageId, senderId: userId },
      { isDeleted: true, deletedAt: new Date(), content: "This message was deleted" }
    );

    socket.broadcast.emit("message-deleted", { conversationId, messageId });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-offline", { userId });
  });
});

connectMongo()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Socket server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start socket server:", error);
    process.exit(1);
  });
