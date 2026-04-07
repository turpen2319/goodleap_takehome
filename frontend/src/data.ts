import type { LoanProduct } from "./types";

export const loanProducts: LoanProduct[] = [
  {
    id: "solar-plus-25",
    name: "Solar Plus 25-Year",
    type: "solar",
    aprRange: { min: 3.99, max: 7.99 },
    termMonths: [120, 180, 240, 300],
    maxAmount: 100000,
    description:
      "Our flagship solar loan product. Competitive rates with flexible terms from 10 to 25 years. Ideal for full residential solar installations. No prepayment penalties.",
  },
  {
    id: "solar-promo-12",
    name: "Solar Promo 12-Month Deferred",
    type: "solar",
    aprRange: { min: 4.99, max: 8.99 },
    termMonths: [120, 180, 240],
    maxAmount: 75000,
    promoDetails: { periodMonths: 12, apr: 0.0 },
    description:
      "Solar loan with a 12-month deferred interest promotional period at 0% APR. Great for homeowners who want to start saving on energy before payments begin.",
  },
  {
    id: "roofing-premium",
    name: "Roofing Premium",
    type: "roofing",
    aprRange: { min: 4.49, max: 9.49 },
    termMonths: [60, 84, 120, 180],
    maxAmount: 60000,
    promoDetails: { periodMonths: 6, apr: 0.0 },
    description:
      "Specialized roofing loan with a 6-month same-as-cash promotional period. Covers full roof replacements, repairs, and solar roof integrations.",
  },
];
