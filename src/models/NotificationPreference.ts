import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationPreference extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: {
    interests: boolean;
    messages: boolean;
    profileViews: boolean;
    payments: boolean;
    promotions: boolean;
    newsletters: boolean;
    security: boolean;
  };
  push: {
    interests: boolean;
    messages: boolean;
    profileViews: boolean;
    payments: boolean;
    promotions: boolean;
  };
  sms: {
    security: boolean;
    payments: boolean;
  };
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      interests: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      profileViews: { type: Boolean, default: false },
      payments: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletters: { type: Boolean, default: false },
      security: { type: Boolean, default: true },
    },
    push: {
      interests: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      profileViews: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    sms: {
      security: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
    },
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: "22:00" },
    quietHoursEnd: { type: String, default: "08:00" },
  },
  { timestamps: true }
);

NotificationPreferenceSchema.index({ userId: 1 }, { unique: true });

const NotificationPreference: Model<INotificationPreference> =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>(
    "NotificationPreference",
    NotificationPreferenceSchema
  );

export default NotificationPreference;