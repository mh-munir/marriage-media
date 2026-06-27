import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  plan: "monthly" | "quarterly" | "half-yearly" | "yearly";
  planDuration: number; // in days
  paymentMethod: "sslcommerz" | "bkash" | "nagad" | "stripe";
  transactionId: string;
  paymentId?: string;
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled" | "refund_pending";
  refundReason?: string;
  refundRequestedAt?: Date;
  refundCompletedAt?: Date;
  invoiceNumber: string;
  billingInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  startDate: Date;
  expiryDate: Date;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "BDT",
    },
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "half-yearly", "yearly"],
      required: [true, "Plan is required"],
    },
    planDuration: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["sslcommerz", "bkash", "nagad", "stripe"],
      required: [true, "Payment method is required"],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled", "refund_pending"],
      default: "pending",
    },
    refundReason: { type: String, default: "" },
    refundRequestedAt: { type: Date },
    refundCompletedAt: { type: Date },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    billingInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;