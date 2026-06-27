import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDelivery {
  channel: "inapp" | "push" | "email" | "sms" | "whatsapp";
  status: "sent" | "failed" | "skipped";
  sentAt?: Date;
  error?: string;
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "interest" | "message" | "profile_view" | "payment" | "verification" | "system" | "promotion";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  /** Channel delivery tracking */
  delivery: INotificationDelivery[];
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["interest", "message", "profile_view", "payment", "verification", "system", "promotion"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    delivery: [
      {
        channel: { type: String, enum: ["inapp", "push", "email", "sms", "whatsapp"] },
        status: { type: String, enum: ["sent", "failed", "skipped"] },
        sentAt: { type: Date },
        error: { type: String },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;