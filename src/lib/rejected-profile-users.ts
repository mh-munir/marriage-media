export async function syncRejectedProfileUserFlags() {
  const [{ default: User }, { default: Verification }] = await Promise.all([
    import("@/models/User"),
    import("@/models/Verification"),
  ]);
  const rejectedUserIds = await Verification.distinct("userId", {
    type: "profile",
    status: "rejected",
  });

  if (rejectedUserIds.length > 0) {
    await User.updateMany(
      {
        _id: { $in: rejectedUserIds },
        isProfileVerificationRejected: { $ne: true },
      },
      { $set: { isProfileVerificationRejected: true } },
    );
  }
}