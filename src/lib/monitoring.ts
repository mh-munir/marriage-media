type MonitoringContext = Record<string, string | number | boolean | null | undefined>;

interface MonitoringPayload {
  level: "info" | "warn" | "error";
  message: string;
  context?: MonitoringContext;
  stack?: string;
  timestamp: string;
  environment: string;
}

const endpoint = process.env.MONITORING_ENDPOINT;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
    stack: undefined,
  };
}

async function ship(payload: MonitoringPayload) {
  if (!endpoint) return;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Monitoring must never break the application path.
  }
}

export const logger = {
  info(message: string, context?: MonitoringContext) {
    const payload: MonitoringPayload = {
      level: "info",
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
    console.info(JSON.stringify(payload));
    void ship(payload);
  },
  warn(message: string, context?: MonitoringContext) {
    const payload: MonitoringPayload = {
      level: "warn",
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
    console.warn(JSON.stringify(payload));
    void ship(payload);
  },
  error(message: string, context?: MonitoringContext) {
    const payload: MonitoringPayload = {
      level: "error",
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
    console.error(JSON.stringify(payload));
    void ship(payload);
  },
};

export function captureException(error: unknown, context?: MonitoringContext) {
  const serialized = serializeError(error);
  const payload: MonitoringPayload = {
    level: "error",
    message: serialized.message,
    context,
    stack: serialized.stack,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };

  console.error(JSON.stringify(payload));
  void ship(payload);
}

export function createPerformanceMark(name: string) {
  const startedAt = performance.now();

  return {
    end(context?: MonitoringContext) {
      logger.info("performance.measure", {
        metric: name,
        durationMs: Math.round(performance.now() - startedAt),
        ...context,
      });
    },
  };
}
