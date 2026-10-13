import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "@/db/index";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await db.execute(sql`SELECT 1`);

          return Response.json({ status: "ok", database: "connected" });
        } catch {
          return Response.json(
            { status: "error", database: "disconnected" },
            { status: 503 },
          );
        }
      },
    },
  },
});
