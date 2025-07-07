import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface SemanticScholarResult {
  paperId: string;
  title: string;
  abstract: string;
  url: string;
  year: number;
  authors: { name: string }[];
}

interface SemanticScholarResponse {
  data: SemanticScholarResult[];
}

export const researchTool = createTool({
  id: "research-topic",
  description: "Perform autonomous research on a given topic using Semantic Scholar",
  inputSchema: z.object({
    query: z.string().describe("A research question or topic (e.g. 'Applications of LLMs in medicine')"),
  }),
  outputSchema: z.object({
    summaries: z.array(z.object({
      title: z.string(),
      abstract: z.string(),
      year: z.number(),
      authors: z.array(z.string()),
      url: z.string(),
    })),
    topic: z.string(),
  }),
  execute: async ({ context }) => {
    return await getResearchResults(context.query);
  },
});

const getResearchResults = async (query: string) => {
  const limit = 5;
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;

  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,authors,year,url`;

  const headers: Record<string, string> = {};

  if (apiKey) {
    headers["x-api-key"] = apiKey;
    console.log("Using Semantic Scholar API key");
  } else {
    console.log("No API key found — using public access (rate limited)");
  }


  const res = await fetch(url, { headers });
  
  if (res.status === 429) {
    throw new Error("Rate limit hit. Please try again later or provide an API key.");
  }

  if (!res.ok) throw new Error(`Failed to fetch Semantic Scholar results: ${res.status}`);

  const data = (await res.json()) as SemanticScholarResponse;

  if (!data.data || data.data.length === 0) {
    throw new Error(
      `No results found for "${query}". Please try a more specific or broader research topic.`
    );
  }

  console.log("API returned papers:", JSON.stringify(data.data, null, 2));

  const summaries = data.data.map(paper => ({
    title: paper.title,
    abstract: paper.abstract,
    year: paper.year,
    authors: paper.authors?.map(a => a.name) || [],
    url: paper.url,
  }));

  return {
    summaries,
    topic: query,
  };
};

