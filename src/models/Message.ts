import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReaction {
  userId: mongoose.Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "voice" | "file" | "emoji" | "system";

  // Media
  fileUrl?: string;
  filePublicId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;

  // Voice message
  voiceUrl?: string;
  voiceDuration?: number; // seconds

  // Read receipts
  isRead: boolean;
  readAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;

  // Reactions
  reactions: IReaction[];

  // Reply
  replyTo?: mongoose.Types.ObjectId;
  replyPreview?: {
    senderName: string;
    content: string;
    messageType: string;
  };

  // Forward
  isForwarded: boolean;

  // Delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedFor: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "voice", "file", "emoji", "system"],
      default: "text",
    },

    // Media
    fileUrl: { type: String, default: "" },
    filePublicId: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },

    // Voice message
    voiceUrl: { type: String, default: "" },
    voiceDuration: { type: Number, default: 0 },

    // Read receipts
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // Reactions
    reactions: { type: [ReactionSchema], default: [] },

    // Reply
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    replyPreview: {
      senderName: { type: String, default: "" },
      content: { type: String, default: "" },
      messageType: { type: String, default: "text" },
    },

    // Forward
    isForwarded: { type: Boolean, default: false },

    // Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ conversationId: 1, messageType: 1 });
MessageSchema.index({ content: "text" });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;