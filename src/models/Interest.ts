import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterest extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
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
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

InterestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
InterestSchema.index({ receiverId: 1, status: 1 });
InterestSchema.index({ senderId: 1, status: 1 });

const Interest: Model<IInterest> =
  mongoose.models.Interest || mongoose.model<IInterest>("Interest", InterestSchema);

export default Interest;