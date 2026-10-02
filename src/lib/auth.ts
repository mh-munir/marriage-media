import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import connectToDatabase from "./mongodb";
import { User, type IUser } from "@/models";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateEmailVerificationToken(email: string): string {
  return jwt.sign({ email, type: "verification" }, JWT_SECRET, { expiresIn: "24h" });
}

export function generatePasswordResetToken(email: string): string {
  return jwt.sign({ email, type: "password-reset" }, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyEmailToken(token: string): { email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; type: string };
    if (payload.type !== "verification") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function verifyPasswordResetToken(token: string): { email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; type: string };
    if (payload.type !== "password-reset") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getCurrentUser(request?: NextRequest): Promise<IUser | null> {
  try {
    await connectToDatabase();

    let token: string | undefined;
    let tokenFromAuthorization = false;

    if (request) {
      // Extract from Authorization header
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        tokenFromAuthorization = true;
      }
      // Or from cookie
      if (!token) {
        token = request.cookies.get("token")?.value;
      }
    } else {
      // Server-side: read from cookie
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    }

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || (!tokenFromAuthorization && payload.role !== "user")) return null;

    const user = await User.findById(payload.userId).select("-password");
    if (!user || !user.isActive || user.isBlocked) return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(request?: NextRequest): Promise<IUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(request?: NextRequest): Promise<IUser> {
  await connectToDatabase();

  const authorization = request?.headers.get("authorization");
  const cookieStore = request ? null : await cookies();
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : request?.cookies.get("adminToken")?.value || cookieStore?.get("adminToken")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) throw new Error("Unauthorized");

  const user = await User.findById(payload.userId).select("-password");
  if (!user || !user.isActive || user.isBlocked) throw new Error("Unauthorized");
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requirePremium(request?: NextRequest): Promise<IUser> {
  const user = await requireAuth(request);
  const { Profile } = await import("@/models");
  const profile = await Profile.findOne({ userId: user._id });

  if (!profile?.isPremium) {
    throw new Error("Premium subscription required");
  }

  return user;
}

export function isPremiumUser(profile: { isPremium?: boolean; premiumExpiry?: Date } | null): boolean {
  if (!profile?.isPremium || !profile?.premiumExpiry) return false;
  return new Date(profile.premiumExpiry) > new Date();
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const prefix = "MM";
  const date = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${date}-${random}`;
}

export function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;
}