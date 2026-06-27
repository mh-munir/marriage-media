import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedSearch extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: Record<string, any>;
  searchQuery: string;
  resultCount: number;
  isAlertEnabled: boolean;
  lastNotifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Search name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    searchQuery: {
      type: String,
      default: "",
    },
    resultCount: {
      type: Number,
      default: 0,
    },
    isAlertEnabled: {
      type: Boolean,
      default: false,
    },
    lastNotifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

SavedSearchSchema.index({ userId: 1, createdAt: -1 });

const SavedSearch: Model<ISavedSearch> =
  mongoose.models.SavedSearch ||
  mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);

export default SavedSearch;