import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { SavedSearch } from "@/models";
import { requireAuth } from "@/lib/auth";

// GET - List all saved searches
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const savedSearches = await SavedSearch.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ savedSearches });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST - Create a saved search
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { name, filters, searchQuery, resultCount, isAlertEnabled } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Search name is required" }, { status: 400 });
    }

    // Limit to 20 saved searches per user
    const count = await SavedSearch.countDocuments({ userId: user._id });
    if (count >= 20) {
      return NextResponse.json(
        { error: "Maximum 20 saved searches allowed" },
        { status: 400 }
      );
    }

    const savedSearch = await SavedSearch.create({
      userId: user._id,
      name: name.trim(),
      filters: filters || {},
      searchQuery: searchQuery || "",
      resultCount: resultCount || 0,
      isAlertEnabled: isAlertEnabled || false,
    });

    return NextResponse.json({ savedSearch }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE - Delete a saved search
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Search ID is required" }, { status: 400 });
    }

    await SavedSearch.findOneAndDelete({ _id: id, userId: user._id });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT - Update a saved search
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { id, name, filters, searchQuery, resultCount, isAlertEnabled } = body;

    if (!id) {
      return NextResponse.json({ error: "Search ID is required" }, { status: 400 });
    }

    const savedSearch = await SavedSearch.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        ...(name && { name: name.trim() }),
        ...(filters && { filters }),
        ...(searchQuery !== undefined && { searchQuery }),
        ...(resultCount !== undefined && { resultCount }),
        ...(isAlertEnabled !== undefined && { isAlertEnabled }),
      },
      { new: true }
    );

    if (!savedSearch) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    return NextResponse.json({ savedSearch });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}