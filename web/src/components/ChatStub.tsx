import { useState } from "react";

/**
 * Static-build stand-in for the "Ask me about Stefan" assistant.
 *
 * The live assistant is powered by the `api/` backend (RAG retrieval + an
 * LLM call), which has no runtime on GitHub Pages. This renders the same
 * floating launcher and a small popup, but shows a static notice instead of
 * calling any backend — nothing here makes a network request.
 *
 * To restore the live assistant, host `api/` somewhere with a Node runtime
 * and swap this back to the CopilotKit `<CopilotPopup>` (see git history of
 * App.tsx), pointing `runtimeUrl` at the deployed API.
 */
export default function ChatStub() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="chat-stub-popup" role="dialog" aria-label="About this chat">
          <h3>Ask me about Stefan</h3>
          <p>
            The AI assistant runs on a separate backend that isn’t part of this
            static site. Meanwhile, the sections above cover Stefan’s
            experience, projects, and skills — or reach out via the contact
            links.
          </p>
        </div>
      )}

      <div
        className={`chat-launcher ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <button
          type="button"
          className={`copilotKitButton ${open ? "open" : ""}`}
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? (
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M4 4h16v12H7l-3 3V4z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          )}
        </button>
        <span className="chat-launcher-label">Ask me about Stefan</span>
      </div>
    </>
  );
}
