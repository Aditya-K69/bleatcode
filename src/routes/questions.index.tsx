import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { Question } from "@/db/schema";

const PAGE_SIZE = 50;

type QuestionsResponse = {
  data: Question[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export const Route = createFileRoute("/questions/")({
  component: QuestionsPage,
});

function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchQuestions() {
      setLoading(true);
      setError(null);

      try {
        const offset = page * PAGE_SIZE;

        const response = await fetch(
          `/api/questions?limit=${PAGE_SIZE}&offset=${offset}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch questions.");
        }

        const result: QuestionsResponse = await response.json();

        setQuestions(result.data);
        setTotal(result.pagination.total);
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

    fetchQuestions();

    return () => controller.abort();
  }, [page, retryCount]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Questions</h1>
        <p className="text-sm text-gray-500">
          Browse and practice coding problems.
        </p>

        {!loading && !error && (
          <p className="text-sm text-gray-500">
            {total.toLocaleString()} questions
          </p>
        )}
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 p-4">
          <p className="font-medium">Unable to load questions</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            className="mt-3 underline"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <p className="py-8 text-center text-gray-500">Loading questions...</p>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Category</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {questions.map((question) => (
                  <tr
                    key={question.questionFrontendId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {question.questionFrontendId}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        to="/questions/$questionFrontendId"
                        params={{
                          questionFrontendId: String(
                            question.questionFrontendId,
                          ),
                        }}
                        className="font-medium hover:underline"
                      >
                        {question.questionTitle}
                      </Link>
                    </td>

                    <td className="px-4 py-3">{question.difficulty}</td>

                    <td className="px-4 py-3 text-gray-500">
                      {question.category}
                    </td>
                  </tr>
                ))}

                {questions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <nav className="flex items-center justify-between gap-4">
            <button
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
              className="rounded border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>

            <button
              disabled={(page + 1) * PAGE_SIZE >= total}
              onClick={() => setPage((current) => current + 1)}
              className="rounded border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
