import { useState } from "react";
import { LoanProductList } from "./components/LoanProductList";
import { ChatPanel } from "./components/ChatPanel";

function App() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Main content — add bottom padding on mobile when panel is open so cards aren't hidden under it */}
      <div className={`flex-1 min-w-0 px-6 py-16 ${panelOpen ? "pb-[47vh] md:pb-16" : ""}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Select a Loan Product
            </h1>
            {!panelOpen && (
              <button
                onClick={() => setPanelOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 hover:shadow-sm active:bg-blue-200 transition-all cursor-pointer whitespace-nowrap shrink-0 ml-3"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
                  />
                </svg>
                Ask AI
              </button>
            )}
          </div>
          <LoanProductList />
        </div>
      </div>

      {/* Chat panel — right side on desktop, bottom on mobile */}
      {panelOpen && (
        <ChatPanel onClose={() => setPanelOpen(false)} />
      )}
    </div>
  );
}

export default App;
