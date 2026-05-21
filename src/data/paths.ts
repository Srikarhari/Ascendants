export interface AscensionPath {
  id: string;
  title: string;
  score: number;
  subtitle: string;
  markers: readonly string[];
  footer: string;
}

export const PATHS: readonly AscensionPath[] = [
  {
    id: "social",
    title: "Social Ascension",
    score: 47,
    subtitle:
      "Optimize desirability, visibility, and first impressions.",
    markers: ["PSL", "Dating Apps", "Instagram", "Softmaxxing"],
    footer: "baseline unstable",
  },
  {
    id: "matrimonial",
    title: "Matrimonial Ascension",
    score: 62,
    subtitle:
      "Calculate family approval, caste-coded respectability, and market value.",
    markers: ["Fairness", "Salary Aura", "Family Approval", "Settleability"],
    footer: "ideal varies by market",
  },
  {
    id: "celebrity",
    title: "Celebrity Ascension",
    score: 54,
    subtitle:
      "Find the public face your face is expected to become.",
    markers: ["Bollywood", "Hollywood", "Influencer", "Aspirational Resemblance"],
    footer: "dataset incomplete",
  },
  {
    id: "professional",
    title: "Professional Ascension",
    score: 69,
    subtitle:
      "Measure executive presence, grooming discipline, and corporate legibility.",
    markers: ["LinkedIn", "Confidence", "Polish", "Controlled Masculinity"],
    footer: "cultural weighting detected",
  },
];
