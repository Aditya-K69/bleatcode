import { createFileRoute } from "@tanstack/react-router";
import { count, asc } from "drizzle-orm";
import { db } from "@/db/index";
import { questions } from "@/db/schema";

export const Route = createFileRoute("/api/questions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        const rawLimit = Number(url.searchParams.get("limit") ?? 50);
        const rawOffset = Number(url.searchParams.get("offset") ?? 0);

        if (
          !Number.isInteger(rawLimit) ||
          rawLimit < 1 ||
          rawLimit > 100 ||
          !Number.isInteger(rawOffset) ||
          rawOffset < 0
        ) {
          return Response.json(
            { error: "Invalid limit or offset" },
            { status: 400 },
          );
        }

        try {
          const [data, [{ total }]] = await Promise.all([
            db
              .select()
              .from(questions)
              .orderBy(asc(questions.questionFrontendId))
              .limit(rawLimit)
              .offset(rawOffset),

            db.select({ total: count() }).from(questions),
          ]);

          return Response.json({
            data,
            pagination: {
              total,
              limit: rawLimit,
              offset: rawOffset,
              hasMore: rawOffset + data.length < total,
            },
          });
        } catch (error) {
          console.error("Failed to fetch questions:", error);

          return Response.json(
            { error: "Failed to fetch questions" },
            { status: 500 },
          );
        }
      },
    },
  },
});
