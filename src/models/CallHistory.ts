import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICallHistory extends Document {
  _id: mongoose.Types.ObjectId;
  callerId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  type: "audio" | "video";
  status: "completed" | "missed" | "declined" | "failed";
  startedAt: Date;
  endedAt?: Date;
  duration: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

const CallHistorySchema = new Schema<ICallHistory>(
  {
    callerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "missed", "declined", "failed"],
      default: "missed",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CallHistorySchema.index({ callerId: 1, createdAt: -1 });
CallHistorySchema.index({ receiverId: 1, createdAt: -1 });
CallHistorySchema.index({ status: 1 });

const CallHistory: Model<ICallHistory> =
  mongoose.models.CallHistory ||
  mongoose.model<ICallHistory>("CallHistory", CallHistorySchema);

export default CallHistory;