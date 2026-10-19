CREATE TABLE "questions" (
	"questionFrontendId" integer NOT NULL,
	"questionTitle" text NOT NULL,
	"TitleSlug" text NOT NULL,
	"content" text NOT NULL,
	"difficulty" text NOT NULL,
	"totalAccepted" text NOT NULL,
	"totalSubmission" text NOT NULL,
	"totalAcceptedRaw" text NOT NULL,
	"totalSubmissionRaw" text NOT NULL,
	"acRate" real NOT NULL,
	"similarQuestions" text NOT NULL,
	"category" text NOT NULL,
	"sampleTestCase" text NOT NULL,
	"metaData" text NOT NULL,
	"topicTags" text NOT NULL
);
