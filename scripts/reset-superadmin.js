/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;
const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "";

async function resetSuperadmin() {
  if (!mongoUri || !adminEmail || !adminPassword) {
    throw new Error("MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  }
  if (!/^\S+@\S+\.\S+$/.test(adminEmail)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  await mongoose.connect(mongoUri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  const User = mongoose.models.User || mongoose.model(
    "User",
    new mongoose.Schema(
      {
        email: { type: String, required: true, lowercase: true, trim: true, unique: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ["user", "admin", "superadmin"] },
        roleMutationAllowed: { type: Boolean, default: false, select: false },
        isActive: { type: Boolean, default: true },
        isBlocked: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

  const superadmins = await User.find({ role: "superadmin" }).select("_id").limit(2).lean();
  if (superadmins.length !== 1) {
    throw new Error(
      `Expected exactly one existing superadmin; found ${superadmins.length}. No account was changed.`
    );
  }

  const existingEmail = await User.findOne({ email: adminEmail }).select("_id").lean();
  if (existingEmail && existingEmail._id.toString() !== superadmins[0]._id.toString()) {
    throw new Error("ADMIN_EMAIL is already assigned to another account. No account was changed.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const updated = await User.findOneAndUpdate(
    { _id: superadmins[0]._id, role: "superadmin" },
    {
      $set: {
        email: adminEmail,
        password: passwordHash,
        roleMutationAllowed: true,
        isActive: true,
        isBlocked: false,
        isEmailVerified: true,
      },
    },
    { new: true, runValidators: true }
  ).select("_id");

  if (!updated) {
    throw new Error("The superadmin account changed during reset. No account was changed.");
  }

  console.log("Superadmin credentials updated successfully.");
}

async function main() {
  try {
    await resetSuperadmin();
  } catch (error) {
    console.error("Superadmin reset failed:", error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
