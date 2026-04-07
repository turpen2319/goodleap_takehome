export interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  licensedStates: string[];
  availableProductIds: string[]
}

export const contractors: Contractor[] = [
  {
    id: "c1",
    companyName: "SunPower Installations",
    contactName: "Maria Garcia",
    licensedStates: ["CA", "AZ", "NV"],
    availableProductIds: ["solar-plus-25", "solar-promo-12", "roofing-premium"],
  },
  {
    id: "c2",
    companyName: "GreenHome Builders",
    contactName: "James Chen",
    licensedStates: ["TX", "FL", "CO"],
    availableProductIds: ["home-imp-standard", "roofing-premium"],
  },
  {
    id: "c3",
    companyName: "AllStar Solar & Roofing",
    contactName: "David Kim",
    licensedStates: ["CA", "TX", "FL", "AZ", "NV", "NY"],
    availableProductIds: [
      "solar-plus-25",
      "solar-promo-12",
      "home-imp-standard",
      "roofing-premium",
    ],
  },
];
