import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { questions } from "@/db/schema";

export const Route = createFileRoute("/api/questions/$questionFrontendId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const questionFrontendId = Number(params.questionFrontendId);

        if (
          !Number.isSafeInteger(questionFrontendId) ||
          questionFrontendId < 1
        ) {
          return Response.json(
            { error: "Invalid question frontend ID" },
            { status: 400 },
          );
        }

        try {
          const [question] = await db
            .select()
            .from(questions)
            .where(eq(questions.questionFrontendId, questionFrontendId))
            .limit(1);

          if (!question) {
            return Response.json(
              { error: "Question not found" },
              { status: 404 },
            );
          }

          return Response.json({ data: question });
        } catch (error) {
          console.error("Failed to fetch question:", error);

          return Response.json(
            { error: "Failed to fetch question" },
            { status: 500 },
          );
        }
      },
    },
  },
});
