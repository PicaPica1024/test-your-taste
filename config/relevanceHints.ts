/**
 * Secondary text checks for OpenAlex Topics that are especially broad or
 * known to contain occasional cross-disciplinary false positives. These are
 * never used by themselves: the Work must already match an OpenAlex Topic.
 */
export const relevanceHints: Record<string, string[]> = {
  "marine-and-freshwater-biology": [
    "marine", "freshwater", "aquatic", "ocean", "coastal", "estuar",
    "lake", "river", "stream", "plankton", "fish", "limnolog",
  ],
  "computer-science-artificial-intelligence": [
    "artificial intelligence", "machine learning", "neural network",
    "expert system", "reinforcement learning", "computer vision",
    "knowledge representation", "algorithm",
  ],
  "computer-science-information-systems": [
    "information system", "database", "data management", "information retrieval",
    "computer network", "software system",
  ],
  "computer-science-theory-and-methods": [
    "algorithm", "computational", "complexity", "automata", "graph theory",
    "formal language", "computer science",
  ],
};
