import mongoose, { Schema } from "mongoose";

const SiteVisitorSchema = new Schema(
  {
    _id: { type: String, required: true },
    firstVisitedAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

const SiteVisitor = mongoose.models.SiteVisitor || mongoose.model("SiteVisitor", SiteVisitorSchema);

export default SiteVisitor;