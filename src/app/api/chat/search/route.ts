import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Message, Conversation } from "@/models";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/chat/search?q=keyword&conversationId=xxx
 * Search messages within a conversation or across all conversations
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const conversationId = searchParams.get("conversationId");
    const messageType = searchParams.get("type"); // text, image, voice, file
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    if (!query && !messageType) {
      return NextResponse.json(
        { error: "Search query or message type filter is required" },
        { status: 400 }
      );
    }

    // Get user's conversations
    const userConversations = await Conversation.find({
      participants: user._id,
    }).select("_id");
    const conversationIds = userConversations.map((c) => c._id);

    // Build filter
    const filter: Record<string, any> = {
      conversationId: { $in: conversationIds },
      isDeleted: false,
    };

    if (conversationId) {
      filter.conversationId = conversationId;
    }

    if (query) {
      filter.content = { $regex: query, $options: "i" };
    }

    if (messageType) {
      filter.messageType = messageType;
    }

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate("senderId", "firstName lastName email")
        .populate("conversationId", "participants")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

    return NextResponse.json({
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}