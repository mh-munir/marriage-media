export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Message, Conversation } from "@/models";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/chat/backup?conversationId=xxx
 * Export all messages for a conversation as downloadable JSON
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const format = searchParams.get("format") || "json"; // json or txt

    if (!conversationId) {
      // Export all conversations
      const userConversations = await Conversation.find({
        participants: user._id,
      })
        .populate("participants", "firstName lastName email")
        .sort({ lastMessageAt: -1 })
        .lean();

      const backupData: any[] = [];

      for (const conv of userConversations) {
        const messages = await Message.find({
          conversationId: conv._id,
          deletedFor: { $ne: user._id },
        })
          .populate("senderId", "firstName lastName email")
          .sort({ createdAt: 1 })
          .lean();

        const otherParticipant = conv.participants.find(
          (p: any) => p._id.toString() !== user._id.toString()
        );

        backupData.push({
          conversationId: conv._id,
          participant: otherParticipant
            ? `${(otherParticipant as any).firstName || ""} ${(otherParticipant as any).lastName || ""}`.trim() || (otherParticipant as any).email
            : "Unknown",
          messageCount: messages.length,
          messages: messages.map((m) => ({
            id: m._id,
            sender: m.senderId
              ? `${(m.senderId as any).firstName || ""} ${(m.senderId as any).lastName || ""}`.trim() || (m.senderId as any).email
              : "Unknown",
            content: m.content,
            type: m.messageType,
            timestamp: m.createdAt,
          })),
        });
      }

      if (format === "txt") {
        let textContent = `Chat Backup - ${new Date().toISOString()}\n`;
        textContent += `User: ${user.email}\n`;
        textContent += "=".repeat(60) + "\n\n";

        for (const conv of backupData) {
          textContent += `\n--- Conversation with ${conv.participant} ---\n`;
          textContent += `Messages: ${conv.messageCount}\n\n`;
          for (const msg of conv.messages) {
            const date = new Date(msg.timestamp).toLocaleString();
            textContent += `[${date}] ${msg.sender}: ${msg.content}\n`;
          }
          textContent += "\n";
        }

        return new NextResponse(textContent, {
          headers: {
            "Content-Type": "text/plain",
            "Content-Disposition": `attachment; filename="chat-backup-${Date.now()}.txt"`,
          },
        });
      }

      return NextResponse.json({
        backup: backupData,
        exportedAt: new Date().toISOString(),
        totalConversations: backupData.length,
        totalMessages: backupData.reduce((sum, c) => sum + c.messageCount, 0),
      });
    }

    // Export specific conversation
    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "firstName lastName email"
    );

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await Message.find({
      conversationId,
      deletedFor: { $ne: user._id },
    })
      .populate("senderId", "firstName lastName email")
      .sort({ createdAt: 1 })
      .lean();

    const otherParticipant = conversation.participants.find(
      (p: any) => p._id.toString() !== user._id.toString()
    );

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      sender: m.senderId
        ? `${(m.senderId as any).firstName || ""} ${(m.senderId as any).lastName || ""}`.trim() || (m.senderId as any).email
        : "Unknown",
      content: m.content,
      type: m.messageType,
      timestamp: m.createdAt,
    }));

    if (format === "txt") {
      let textContent = `Chat Backup - Conversation\n`;
      textContent += `With: ${otherParticipant ? `${(otherParticipant as any).firstName || ""} ${(otherParticipant as any).lastName || ""}`.trim() || (otherParticipant as any).email : "Unknown"}\n`;
      textContent += `Exported: ${new Date().toISOString()}\n`;
      textContent += `Messages: ${messages.length}\n`;
      textContent += "=".repeat(60) + "\n\n";

      for (const msg of formattedMessages) {
        const date = new Date(msg.timestamp).toLocaleString();
        textContent += `[${date}] ${msg.sender}: ${msg.content}\n`;
      }

      return new NextResponse(textContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="chat-backup-${Date.now()}.txt"`,
        },
      });
    }

    return NextResponse.json({
      conversation: {
        id: conversation._id,
        participant: otherParticipant
          ? `${(otherParticipant as any).firstName || ""} ${(otherParticipant as any).lastName || ""}`.trim() || (otherParticipant as any).email
          : "Unknown",
      },
      messages: formattedMessages,
      exportedAt: new Date().toISOString(),
      totalMessages: messages.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}