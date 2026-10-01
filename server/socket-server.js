/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const PORT = Number(process.env.SOCKET_PORT || process.env.PORT || 3001);
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
const ProfileSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const UserSchema = new mongoose.Schema({}, { strict: false });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

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
    if (!payload.userId || !isObjectId(payload.userId)) {
      throw new Error("Invalid user token");
    }
    await connectMongo();
    const user = await User.findById(payload.userId).select("isActive isBlocked").lean();
    if (!user || user.isActive !== true || user.isBlocked === true) {
      throw new Error("Inactive user");
    }
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);

  const emitToPeers = (participants, event, payload) => {
    const peerIds = new Set(participants.map(normalizeId).filter((participantId) => participantId && participantId !== userId));
    for (const peerId of peerIds) {
      socket.to(`user:${peerId}`).emit(event, payload);
    }
  };

  const notifyPeersOnline = (event) => {
    Conversation.find({ participants: userId }).select("participants").lean()
      .then((conversations) => conversations.forEach((conversation) => emitToPeers(conversation.participants || [], event, { userId })))
      .catch(() => {});
  };

  notifyPeersOnline("user-online");

  socket.on("join", (requestedUserId) => {
    if (requestedUserId === userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on("typing", async (payload) => {
    if (!payload || !isObjectId(payload.conversationId)) return;
    const conversation = await Conversation.findOne({
      _id: payload.conversationId,
      participants: userId,
    }).select("participants").lean();
    if (!conversation) return;
    emitToPeers(conversation.participants || [], "typing", {
      conversationId: payload.conversationId,
      userId,
      isTyping: payload.isTyping === true,
    });
  });

  socket.on("send-message", async (payload) => {
    try {
      if (!payload || typeof payload !== "object") return;
      const senderId = normalizeId(payload.senderId) || userId;
      const receiverId = normalizeId(payload.receiverId);
      const conversationId = normalizeId(payload.conversationId);

      if (senderId !== userId || !isObjectId(receiverId) || !isObjectId(conversationId)) {
        return;
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $all: [senderId, receiverId] },
      }).select("participants").lean();
      if (!conversation) return;

      const messageId = normalizeId(payload.id || payload._id);
      let storedMessage;

      if (isObjectId(messageId)) {
        storedMessage = await Message.findOne({
          _id: messageId,
          conversationId,
          senderId,
          receiverId,
        }).lean();
        if (!storedMessage) return;
      } else {
        const content = typeof payload.content === "string" ? payload.content : "";
        const messageType = payload.messageType || payload.type || "text";
        const validMessageTypes = new Set(["text", "image", "voice", "file", "emoji", "system"]);
        if (content.length > 5000 || !validMessageTypes.has(messageType)) return;

        const replyId = normalizeId(payload.replyTo);
        const replyMessage = isObjectId(replyId)
          ? await Message.findOne({ _id: replyId, conversationId }).select("senderId content messageType").lean()
          : null;

        storedMessage = await Message.create({
          conversationId,
          senderId,
          receiverId,
          content,
          messageType,
          fileUrl: typeof payload.fileUrl === "string" ? payload.fileUrl : "",
          fileName: typeof payload.fileName === "string" ? payload.fileName.slice(0, 255) : "",
          fileSize: Number.isFinite(payload.fileSize) ? Math.max(0, payload.fileSize) : 0,
          mimeType: typeof payload.mimeType === "string" ? payload.mimeType.slice(0, 128) : "",
          thumbnailUrl: typeof payload.thumbnailUrl === "string" ? payload.thumbnailUrl : "",
          voiceUrl: typeof payload.voiceUrl === "string" ? payload.voiceUrl : "",
          voiceDuration: Number.isFinite(payload.voiceDuration) ? Math.max(0, payload.voiceDuration) : 0,
          replyTo: replyMessage?._id,
          replyPreview: replyMessage ? {
            senderName: normalizeId(replyMessage.senderId),
            content: replyMessage.content.substring(0, 100),
            messageType: replyMessage.messageType,
          } : undefined,
          isRead: false,
          isDelivered: false,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: storedMessage._id,
          lastMessagePreview: storedMessage.content.substring(0, 100),
          lastMessageType: storedMessage.messageType,
          lastMessageAt: new Date(),
          $inc: { "participantInfo.$[receiver].unreadCount": 1 },
        }, {
          arrayFilters: [{ "receiver.userId": receiverId }],
        });

      }

      let message = {
        id: normalizeId(storedMessage._id),
        conversationId,
        senderId,
        receiverId,
        content: storedMessage.content,
        messageType: storedMessage.messageType,
        fileUrl: storedMessage.fileUrl || "",
        fileName: storedMessage.fileName || "",
        fileSize: storedMessage.fileSize || 0,
        mimeType: storedMessage.mimeType || "",
        thumbnailUrl: storedMessage.thumbnailUrl || "",
        voiceUrl: storedMessage.voiceUrl || "",
        voiceDuration: storedMessage.voiceDuration || 0,
        isRead: storedMessage.isRead,
        isDelivered: storedMessage.isDelivered,
        createdAt: storedMessage.createdAt,
      };

      const [senderProfile, receiverProfile] = await Promise.all([
        Profile.findOne({ userId: senderId }).select("isPremium premiumExpiry").lean(),
        Profile.findOne({ userId: receiverId }).select("isPremium premiumExpiry").lean(),
      ]);
      const now = new Date();
      const senderIsPremium = Boolean(senderProfile?.isPremium && senderProfile.premiumExpiry && new Date(senderProfile.premiumExpiry) > now);
      const receiverIsPremium = Boolean(receiverProfile?.isPremium && receiverProfile.premiumExpiry && new Date(receiverProfile.premiumExpiry) > now);
      if (senderIsPremium && !receiverIsPremium) {
        message = {
          ...message,
          content: "This premium member's message is locked.",
          fileUrl: "",
          voiceUrl: "",
          thumbnailUrl: "",
          isLocked: true,
        };
      }

      socket.to(`user:${receiverId}`).emit("new-message", message);
    } catch {
      socket.emit("message-error", {
        message: "Failed to send message",
      });
    }
  });

  socket.on("message-delivered", async (payload) => {
    if (!payload || !isObjectId(payload.messageId)) return;
    const message = await Message.findOneAndUpdate(
      { _id: payload.messageId, receiverId: userId },
      { isDelivered: true, deliveredAt: new Date() },
      { new: true },
    ).select("senderId conversationId").lean();
    if (!message) return;
    socket.to(`user:${normalizeId(message.senderId)}`).emit("message-delivered", {
      messageId: payload.messageId,
      conversationId: normalizeId(message.conversationId),
    });
  });

  socket.on("add-reaction", async (payload) => {
    if (!payload || !isObjectId(payload.messageId) || !isObjectId(payload.conversationId)) return;
    const emoji = payload.reaction && payload.reaction.emoji;
    if (typeof emoji !== "string" || !emoji || emoji.length > 16) return;

    const conversation = await Conversation.findOne({
      _id: payload.conversationId,
      participants: userId,
    }).select("participants").lean();
    const message = await Message.findOne({ _id: payload.messageId, conversationId: payload.conversationId }).select("_id").lean();
    if (!conversation || !message) return;

    await Message.findByIdAndUpdate(payload.messageId, {
      $pull: { reactions: { userId } },
    });
    await Message.findByIdAndUpdate(payload.messageId, {
      $push: { reactions: { userId, emoji, createdAt: new Date() } },
    });

    emitToPeers(conversation.participants || [], "reaction-added", {
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      reaction: { userId, emoji },
    });
  });

  socket.on("delete-message", async (payload) => {
    if (!payload || !isObjectId(payload.conversationId) || !isObjectId(payload.messageId)) return;
    const conversation = await Conversation.findOne({
      _id: payload.conversationId,
      participants: userId,
    }).select("participants").lean();
    if (!conversation) return;

    const deleted = await Message.findOneAndUpdate(
      { _id: payload.messageId, conversationId: payload.conversationId, senderId: userId },
      { isDeleted: true, deletedAt: new Date(), content: "This message was deleted" },
    ).select("_id").lean();
    if (!deleted) return;

    emitToPeers(conversation.participants || [], "message-deleted", {
      conversationId: payload.conversationId,
      messageId: payload.messageId,
    });
  });

  socket.on("disconnect", () => {
    notifyPeersOnline("user-offline");
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
