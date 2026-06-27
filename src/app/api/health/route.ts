export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Check MongoDB
  try {
    await connectToDatabase();
    checks.database = "connected";
  } catch {
    checks.database = "disconnected";
    healthy = false;
  }

  // Check environment variables
  const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI"];
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      checks[`env_${envVar}`] = "set";
    } else {
      checks[`env_${envVar}`] = "missing";
      healthy = false;
    }
  }

  checks.uptime = `${Math.floor(process.uptime())}s`;
  checks.memory = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
  checks.timestamp = new Date().toISOString();

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}