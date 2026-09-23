import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILookupOption extends Document {
  category: string;
  value: string;
  label: string;
  labelBn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LookupOptionSchema = new Schema<ILookupOption>(
  {
    category: { type: String, required: true, index: true },
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    labelBn: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

LookupOptionSchema.index({ category: 1, value: 1 }, { unique: true });

const LookupOption: Model<ILookupOption> =
  mongoose.models.LookupOption || mongoose.model<ILookupOption>("LookupOption", LookupOptionSchema);

export default LookupOption;
