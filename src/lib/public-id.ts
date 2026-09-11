import { Types } from "mongoose";
import Counter from "@/models/Counter";
import User from "@/models/User";
import Profile from "@/models/Profile";

export async function allocatePublicId(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { key: "user-public-id" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return `IMD-${String(counter?.sequence ?? 1).padStart(2, "0")}`;
}

export async function ensurePublicIdForProfile(
  userId: Types.ObjectId | string,
  profilePublicId?: string
): Promise<string> {
  if (profilePublicId) return profilePublicId;

  const existingUser = await User.findById(userId).select("publicId").lean<{ publicId?: string }>();
  if (existingUser?.publicId) {
    await Profile.updateOne(
      {
        userId,
        $or: [{ publicId: { $exists: false } }, { publicId: "" }],
      },
      { $set: { publicId: existingUser.publicId } }
    );
    return existingUser.publicId;
  }

  const generatedId = await allocatePublicId();
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [{ publicId: { $exists: false } }, { publicId: "" }],
    },
    { $set: { publicId: generatedId } },
    { new: true }
  ).select("publicId").lean<{ publicId?: string }>();

  const publicId = user?.publicId;

  if (!publicId) return "";

  await Profile.updateOne(
    {
      userId,
      $or: [{ publicId: { $exists: false } }, { publicId: "" }],
    },
    { $set: { publicId } }
  );

  return publicId;
}
