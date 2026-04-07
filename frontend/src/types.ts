export interface LoanProduct {
  id: string;
  name: string;
  type: "solar" | "home_improvement" | "roofing";
  aprRange: { min: number; max: number };
  termMonths: number[];
  maxAmount: number;
  promoDetails?: { periodMonths: number; apr: number };
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
}
