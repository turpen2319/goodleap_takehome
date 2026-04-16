import { useState, useCallback, useMemo } from "react";
import { LoanProductList } from "./components/LoanProductList";
import { ChatPanel } from "./components/ChatPanel";
import type { LoanProduct } from "./types";

const DEFAULT_PANEL_WIDTH = 384;

export interface ContextProduct {
  id: string;
  name: string;
}

function App() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [contextProducts, setContextProducts] = useState<ContextProduct[]>([]);

  const handleAskAI = useCallback((product: LoanProduct) => {
    setPanelOpen(true);
    setContextProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, { id: product.id, name: product.name }];
    });
  }, []);

  const handleRemoveContext = useCallback((id: string) => {
    setContextProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const contextProductIds = useMemo(
    () => new Set(contextProducts.map((p) => p.id)),
    [contextProducts],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="px-6 py-16 transition-[margin,padding] duration-200"
        style={{
          marginRight: panelOpen && window.innerWidth >= 768 ? panelWidth : 0,
          paddingBottom: panelOpen && window.innerWidth < 768 ? "47vh" : undefined,
        }}
      >
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
          <LoanProductList
            onAskAI={handleAskAI}
            onRemoveContext={handleRemoveContext}
            contextProductIds={contextProductIds}
          />
        </div>
      </div>

      {panelOpen && (
        <ChatPanel
          onClose={() => setPanelOpen(false)}
          panelWidth={panelWidth}
          onWidthChange={setPanelWidth}
          contextProducts={contextProducts}
          onRemoveContext={handleRemoveContext}
        />
      )}
    </div>
  );
}

export default App;
