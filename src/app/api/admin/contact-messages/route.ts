export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ContactMessage } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();
    const { id, isRead } = await request.json() as { id?: string; isRead?: boolean };
    if (!id || typeof isRead !== "boolean") return NextResponse.json({ error: "Message id and read status are required" }, { status: 400 });
    const message = await ContactMessage.findByIdAndUpdate(id, { $set: { isRead } }, { returnDocument: "after" }).lean();
    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
