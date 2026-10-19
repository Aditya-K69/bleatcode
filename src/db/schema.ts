import { pgTable, integer, text, real } from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  questionFrontendId: integer("questionFrontendId").notNull(),
  questionTitle: text("questionTitle").notNull(),
  TitleSlug: text("TitleSlug").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty").notNull(),
  totalAccepted: text("totalAccepted").notNull(),
  totalSubmission: text("totalSubmission").notNull(),
  totalAcceptedRaw: text("totalAcceptedRaw").notNull(),
  totalSubmissionRaw: text("totalSubmissionRaw").notNull(),
  acRate: real("acRate").notNull(),
  similarQuestions: text("similarQuestions").notNull(),
  category: text("category").notNull(),
  sampleTestCase: text("sampleTestCase").notNull(),
  metaData: text("metaData").notNull(),
  topicTags: text("topicTags").notNull(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
