import mongoose, { Schema, Document, Model } from "mongoose";

export interface IParticipantInfo {
  userId: mongoose.Types.ObjectId;
  unreadCount: number;
  lastReadAt?: Date;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  participantInfo: IParticipantInfo[];
  lastMessage?: mongoose.Types.ObjectId;
  lastMessagePreview?: string;
  lastMessageType?: string;
  lastMessageAt?: Date;
  isGroupChat: boolean;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantInfoSchema = new Schema<IParticipantInfo>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    unreadCount: { type: Number, default: 0 },
    lastReadAt: { type: Date },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    participantInfo: {
      type: [ParticipantInfoSchema],
      default: [],
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessagePreview: {
      type: String,
      default: "",
    },
    lastMessageType: {
      type: String,
      default: "text",
    },
    lastMessageAt: {
      type: Date,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ "participantInfo.userId": 1, "participantInfo.isArchived": 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;