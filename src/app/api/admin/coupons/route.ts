export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Coupon } from "@/models";
import { requireAdmin } from "@/lib/auth";

// Get all coupons
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(),
    ]);

    return NextResponse.json({
      coupons,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Create coupon
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await requireAdmin(request);

    const body = await request.json();
    const coupon = await Coupon.create({
      ...body,
      createdBy: admin._id,
      code: body.code.toUpperCase(),
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Update coupon
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAdmin(request);

    const body = await request.json();
    const { couponId, ...updates } = body;

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    if (updates.code) updates.code = updates.code.toUpperCase();

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ coupon });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}