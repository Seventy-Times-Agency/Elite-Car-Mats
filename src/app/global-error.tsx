"use client";

/**
 * Root-layout error boundary. Renders when the root layout (or anything
 * above the regular app/error.tsx) throws — at which point the normal
 * tree, including providers and globals.css, is gone. Because of that
 * we have to ship our own <html> + <body> + minimal inline styling and
 * cannot rely on the Tailwind classes the rest of the app uses.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0F0F",
          color: "#F0ECE5",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <main
          style={{
            maxWidth: 480,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#D4A54A",
              margin: 0,
            }}
          >
            Elite Car Mats
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "16px 0 8px",
              lineHeight: 1.2,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "rgba(240, 236, 229, 0.7)",
              fontSize: 14,
              lineHeight: 1.5,
              margin: "0 0 24px",
            }}
          >
            We hit an unexpected error. Reload the page and try again — if
            the problem sticks, write us at{" "}
            <a
              href="mailto:info@elitecarmats.us"
              style={{ color: "#D4A54A", textDecoration: "underline" }}
            >
              info@elitecarmats.us
            </a>
            .
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #E8C068, #D4A54A)",
              color: "#0F0F0F",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: 24,
                fontSize: 10,
                color: "rgba(240, 236, 229, 0.4)",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              error id: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
