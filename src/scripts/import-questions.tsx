import { createReadStream } from "node:fs";
import { parse } from "csv-parse";
import { db } from "@/db/index";
import { questions } from "@/db/schema";

const BATCH_SIZE = 500;

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    throw new Error("Usage: bun run scripts/import-questions.ts <csv-file>");
  }

  const parser = createReadStream(csvPath).pipe(
    parse({
      columns: true,
      bom: true,
      skip_empty_lines: true,
    }),
  );

  let batch: (typeof questions.$inferInsert)[] = [];
  let imported = 0;

  try {
    for await (const rawRow of parser) {
      const row = rawRow as Record<string, string>;

      batch.push({
        questionFrontendId: Number(row.questionFrontendId),
        questionTitle: row.questionTitle,
        TitleSlug: row.TitleSlug,
        content: row.content,
        difficulty: row.difficulty,
        totalAccepted: row.totalAccepted,
        totalSubmission: row.totalSubmission,
        totalAcceptedRaw: row.totalAcceptedRaw,
        totalSubmissionRaw: row.totalSubmissionRaw,
        acRate: Number(row.acRate),
        similarQuestions: row.similarQuestions,
        category: row.category,
        sampleTestCase: row.sampleTestCase,
        metaData: row.metaData,
        topicTags: row.topicTags,
      });

      if (batch.length >= BATCH_SIZE) {
        await db.insert(questions).values(batch);
        imported += batch.length;
        console.log(`Imported ${imported} questions`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await db.insert(questions).values(batch);
      imported += batch.length;
    }

    console.log(`Import complete: ${imported} questions imported.`);
  } finally {
    parser.destroy();
    await db.$client.end();
  }
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exitCode = 1;
});
