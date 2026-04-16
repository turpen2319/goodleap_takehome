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

export function createCalculateMonthlyPayment(contractorId: string) {
  return tool(
    "calculate_monthly_payment",
    "Calculate estimated monthly payments for a loan product given a loan amount. Returns payment breakdowns across all available terms using the product's mid-range APR.",
    {
      product_id: z
        .enum(loanProducts.map((p) => p.id) as [string, ...string[]])
        .describe("The loan product ID to calculate for"),
      loan_amount: z.number().positive().describe("The loan amount in dollars"),
    },
    async (args) => {
      const contractor = contractors.find((c) => c.id === contractorId);
      if (!contractor) {
        return {
          content: [{ type: "text" as const, text: "Contractor not found." }],
          isError: true,
        };
      }

      const product = loanProducts.find((p) => p.id === args.product_id);
      if (!product) {
        return {
          content: [{ type: "text" as const, text: `Product '${args.product_id}' not found.` }],
          isError: true,
        };
      }

      if (!contractor.availableProductIds.includes(product.id)) {
        return {
          content: [{ type: "text" as const, text: `Product '${args.product_id}' is not available to this contractor.` }],
          isError: true,
        };
      }

      if (args.loan_amount > product.maxAmount) {
        return {
          content: [{ type: "text" as const, text: `Loan amount $${args.loan_amount.toLocaleString()} exceeds the maximum of $${product.maxAmount.toLocaleString()} for this product.` }],
          isError: true,
        };
      }

      const midApr = (product.aprRange.min + product.aprRange.max) / 2;
      const monthlyRate = midApr / 100 / 12;
      const principal = args.loan_amount;

      const termBreakdowns = product.termMonths.map((n) => {
        const monthlyPayment =
          monthlyRate === 0
            ? principal / n
            : (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
              (Math.pow(1 + monthlyRate, n) - 1);
        const totalPaid = monthlyPayment * n;
        return {
          term_months: n,
          monthly_payment: Math.round(monthlyPayment * 100) / 100,
          total_paid: Math.round(totalPaid * 100) / 100,
          total_interest: Math.round((totalPaid - principal) * 100) / 100,
        };
      });

      const result = {
        product_id: product.id,
        product_name: product.name,
        loan_amount: principal,
        apr_used: Math.round(midApr * 100) / 100,
        apr_range: product.aprRange,
        terms: termBreakdowns,
        ...(product.promoDetails && {
          promo_note: `This product has a ${product.promoDetails.periodMonths}-month promotional period at ${product.promoDetails.apr}% APR. Payments above apply after the promo period ends.`,
        }),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
