import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { loanProducts } from "../../data/loan-products.js";
import { contractors } from "../../data/contractors.js";

export function createQueryLoanProducts(contractorId: string) {
  return tool(
    "query_loan_products",
    "Query the loan product catalog available to this contractor. Optionally filter by product type or state.",
    {
      product_type: z
        .enum(["solar", "home_improvement", "roofing"])
        .optional()
        .describe("Filter by product type"),
      state: z
        .string()
        .optional()
        .describe("Filter to products eligible in this state (two-letter code)"),
    },
    async (args) => {
      const contractor = contractors.find((c) => c.id === contractorId);
      if (!contractor) {
        return {
          content: [{ type: "text" as const, text: "Contractor not found." }],
          isError: true,
        };
      }

      let results = loanProducts.filter((p) =>
        contractor.availableProductIds.includes(p.id)
      );

      if (args.product_type) {
        results = results.filter((p) => p.type === args.product_type);
      }

      if (args.state) {
        const state = args.state.toUpperCase();
        results = results.filter((p) => p.eligibleStates.includes(state));
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(results, null, 2) },
        ],
      };
    }
  );
}
