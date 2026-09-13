export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { User } from "@/models";

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = (await request.json()) as { firstName?: string; lastName?: string; gender?: string };
    const firstName = body.firstName?.trim() || "";
    const lastName = body.lastName?.trim() || "";

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
    }
    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json({ error: "Name cannot exceed 50 characters." }, { status: 400 });
    }
    if (body.gender !== "Male" && body.gender !== "Female") {
      return NextResponse.json({ error: "Please select Male or Female." }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { firstName, lastName, gender: body.gender, onboardingCompleted: true } },
      { new: true, runValidators: true }
    ).select("firstName lastName gender onboardingCompleted");

    return NextResponse.json({ onboarding: updatedUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to save onboarding details.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
