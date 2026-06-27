export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Message } from "@/models";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/chat/reactions
 * Add or toggle a reaction on a message
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { messageId, emoji } = body;

    if (!messageId || !emoji) {
      return NextResponse.json(
        { error: "Message ID and emoji are required" },
        { status: 400 }
      );
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user already reacted with same emoji
    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === user._id.toString() && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      // Remove reaction (toggle off)
      message.reactions.splice(existingIndex, 1);
    } else {
      // Remove any existing reaction from this user, then add new one
      message.reactions = message.reactions.filter(
        (r) => r.userId.toString() !== user._id.toString()
      );
      message.reactions.push({ userId: user._id, emoji, createdAt: new Date() });
    }

    await message.save();

    return NextResponse.json({
      reactions: message.reactions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/chat/reactions?messageId=xxx
 * Remove all reactions from a user on a message
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== user._id.toString()
    );
    await message.save();

    return NextResponse.json({ reactions: message.reactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}