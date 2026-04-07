// Phrases that strongly signal the model is making a credit decision or product recommendation.
// These are intentionally specific multi-word phrases to avoid false positives on normal
// informational language (e.g., "you qualify" would false-positive on "products you qualify for"
// being mentioned in a declined-to-answer context).
const NON_COMPLIANT_PHRASES = [
  // Credit decision / approval language
  "you would be approved",
  "you will be approved",
  "you should be approved",
  "you'll be approved",
  "you would likely be approved",
  "you'll likely be approved",
  "your chances of approval are",
  "high chance of approval",
  "likely to be approved",
  "unlikely to be approved",
  "you qualify for",
  "you would qualify for",
  "you should qualify for",
  "you don't qualify",
  "you do not qualify",
  "based on your credit",
  "with your credit score",
  "given your credit",
  "your income qualifies",
  "your income should qualify",
  // Product recommendation language
  "i recommend",
  "i would recommend",
  "i'd recommend",
  "my recommendation is",
  "the best option for you",
  "the best product for you",
  "the best choice for you",
  "your best bet is",
  "you should go with",
  "you should choose",
  "i suggest",
  "i would suggest",
  "i'd suggest",
  "the ideal product for",
  "perfect fit for your",
];

export const COMPLIANCE_FALLBACK =
  "I'm sorry, but I can only provide factual information about available loan products and their terms. I can't make recommendations or speak to credit decisions. Is there anything else I can help you with regarding loan product details?";

export function checkCompliance(buffer: string): boolean {
  const lower = buffer.toLowerCase();
  return NON_COMPLIANT_PHRASES.some((phrase) => lower.includes(phrase));
}
