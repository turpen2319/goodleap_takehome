export interface LoanProduct {
  id: string;
  name: string;
  type: "solar" | "home_improvement" | "roofing";
  aprRange: { min: number; max: number };
  termMonths: number[];
  maxAmount: number;
  promoDetails?: { periodMonths: number; apr: number };
  description: string;
  eligibleStates: string[];
}

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
    eligibleStates: ["CA", "TX", "FL", "AZ", "NV", "CO", "NY", "NJ"],
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
      "Solar loan with a 12-month deferred interest promotional period at 0% APR. Homeowners make no payments during the promo period. After promo ends, standard rates apply for the remaining term. Great for homeowners who want to start saving on energy before payments begin.",
    eligibleStates: ["CA", "TX", "FL", "AZ", "NV"],
  },
  {
    id: "home-imp-standard",
    name: "Home Improvement Standard",
    type: "home_improvement",
    aprRange: { min: 5.99, max: 12.99 },
    termMonths: [36, 60, 84, 120],
    maxAmount: 50000,
    description:
      "General-purpose home improvement loan. Covers renovations, HVAC, windows, insulation, and more. Shorter terms available for smaller projects.",
    eligibleStates: [
      "CA", "TX", "FL", "AZ", "NV", "CO", "NY", "NJ", "PA", "OH", "IL",
    ],
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
      "Specialized roofing loan with a 6-month same-as-cash promotional period. If paid in full within 6 months, no interest is charged. Otherwise, standard rates apply for the full term. Covers full roof replacements, repairs, and solar roof integrations.",
    eligibleStates: ["CA", "TX", "FL", "AZ", "CO", "NY"],
  },
  {
    id: "roofing-essential",
    name: "Roofing Essential",
    type: "roofing",
    aprRange: { min: 6.99, max: 13.99 },
    termMonths: [36, 60, 84, 120],
    maxAmount: 40000,
    description:
      "Entry-level roofing loan for smaller replacements and repairs. Fixed monthly payments with no promotional period and no prepayment penalties. Streamlined application process.",
    eligibleStates: [
      "CA", "TX", "FL", "AZ", "NV", "CO", "NY", "NJ", "PA", "OH", "IL",
    ],
  },
];
