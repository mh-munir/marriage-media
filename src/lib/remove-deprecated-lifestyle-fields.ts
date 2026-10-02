import { Profile, User } from "@/models";

let migrationComplete = false;

export async function removeDeprecatedLifestyleFields(): Promise<void> {
  if (migrationComplete) return;

  await Promise.all([
    Profile.updateMany(
      {},
      { $unset: { hobbies: 1, smoke: 1, drink: 1 } },
    ),
    Profile.updateMany(
      { diet: "No Preference" } as never,
      { $unset: { diet: 1 } },
    ),
    User.updateMany(
      { "onboardingData": { $exists: true } },
      { $unset: { "onboardingData.hobbies": 1, "onboardingData.smoke": 1, "onboardingData.drink": 1, "onboardingData.diet": 1 } },
    ),
  ]);

  migrationComplete = true;
}
