import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Question } from "@/db/schema";

export const Route = createFileRoute("/questions/$questionFrontendId")({
  component: QuestionPage,
});

function QuestionPage() {
  const { questionFrontendId } = Route.useParams();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchQuestion() {
      setLoading(true);
      setError(null);
      setQuestion(null);

      try {
        const response = await fetch(
          `/api/questions/${encodeURIComponent(questionFrontendId)}`,
          { signal: controller.signal },
        );

        if (response.status === 404) {
          throw new Error("Question not found.");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch question.");
        }

        const result: { data: Question } = await response.json();
        setQuestion(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchQuestion();

    return () => controller.abort();
  }, [questionFrontendId]);

  if (loading) {
    return <main className="p-8">Loading question...</main>;
  }

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Unable to load question</h1>
        <p className="mt-2 text-red-500">{error}</p>
      </main>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <p className="text-sm text-gray-500">
          Question {question.questionFrontendId}
        </p>

        <h1 className="text-3xl font-bold">{question.questionTitle}</h1>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded bg-gray-100 px-3 py-1 text-gray-800">
            {question.difficulty}
          </span>

          <span className="rounded bg-gray-100 px-3 py-1 text-gray-800">
            {question.category}
          </span>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Description</h2>

        <article
          className="question-content"
          dangerouslySetInnerHTML={{ __html: question.content }}
        />
      </section>

      {question.sampleTestCase && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Sample Test Case</h2>
          <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm">
            {question.sampleTestCase}
          </pre>
        </section>
      )}

      {question.topicTags && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Topics</h2>
          <p>{question.topicTags}</p>
        </section>
      )}

      {question.similarQuestions && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Similar Questions</h2>
          <p>{question.similarQuestions}</p>
        </section>
      )}
    </main>
  );
}
