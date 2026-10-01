/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;
const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "";

async function ensureAdminAccount() {
  if (!mongoUri || !adminEmail || !adminPassword) {
    throw new Error("MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required to bootstrap an admin account.");
  }

  await mongoose.connect(mongoUri);

  const User = mongoose.models.User || mongoose.model(
    "User",
    new mongoose.Schema(
      {
        email: { type: String, required: true, lowercase: true, trim: true, unique: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
        roleMutationAllowed: { type: Boolean, default: false, select: false },
        isActive: { type: Boolean, default: true },
        isBlocked: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        profileCompleted: { type: Number, default: 0 },
      },
      { timestamps: true }
    )
  );

  let user = await User.findOne({ email: adminEmail }).select("+password");

  if (!user) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    user = await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: "superadmin",
      roleMutationAllowed: true,
      isActive: true,
      isBlocked: false,
      isEmailVerified: true,
      isPhoneVerified: false,
      profileCompleted: 100,
    });
    console.log(`Created admin account: ${adminEmail}`);
    return;
  }

  const passwordMatches = await bcrypt.compare(adminPassword, user.password);

  if (!passwordMatches || user.role !== "superadmin" || !user.isActive || user.isBlocked) {
    const nextPassword = await bcrypt.hash(adminPassword, 12);
    user = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          password: nextPassword,
          role: "superadmin",
          roleMutationAllowed: true,
          isActive: true,
          isBlocked: false,
          isEmailVerified: true,
          isPhoneVerified: false,
          profileCompleted: 100,
        },
      },
      { new: true, runValidators: true }
    );

    console.log(`Updated admin account: ${adminEmail}`);
    return;
  }

  console.log(`Admin account already exists and is valid: ${adminEmail}`);
}

async function main() {
  try {
    await ensureAdminAccount();
  } catch (error) {
    console.error("Admin bootstrap failed:", error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
