import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { createQueryLoanProducts, createCalculateMonthlyPayment } from "./tools.js";

export function createToolServer(contractorId: string) {
  return createSdkMcpServer({
    name: "loan-product-assistant",
    version: "1.0.0",
    tools: [
      createQueryLoanProducts(contractorId),
      createCalculateMonthlyPayment(contractorId),
    ],
  });
}
