import { GoogleGenAI } from "@google/genai";
import { NewsArticle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // We request a JSON output directly to ensure we get clean titles and dates.
    // We limit to 6 items for speed.
    const prompt = `
      Search for the latest (last 7 days) Korean news articles about "${topicQuery}". 
      Select the 6 most relevant and authoritative articles.
      Sort the list by date descending (newest article first).
      Return a raw JSON array (no markdown code blocks) of objects with these exact keys:
      - "title": A clear, concise headline in Korean (NOT a URL).
      - "date": The publication date in 'YYYY.MM.DD' format.
      - "source": The name of the news outlet.
      - "url": The direct link to the article.
      - "snippet": A 1-sentence summary.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Clean up markdown if present
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    let articles: NewsArticle[] = [];
    
    try {
      articles = JSON.parse(cleanText);
    } catch (e) {
      console.warn("Failed to parse JSON from model, falling back to grounding metadata if available", e);
      // Fallback: If JSON parsing fails, try to use grounding chunks directly
      // This is a safety net
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        articles = groundingChunks
          .map((chunk: any) => {
             if (chunk.web) {
               return {
                 title: chunk.web.title,
                 url: chunk.web.uri,
                 source: "Web",
                 date: "",
                 snippet: ""
               };
             }
             return null;
          })
          .filter((item: any) => item !== null) as NewsArticle[];
      }
    }

    // Sort by date descending (YYYY.MM.DD string comparison works correctly)
    articles.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      // Newest date (larger string) should come first
      return dateB.localeCompare(dateA);
    });

    // Post-processing to ensure quality
    return articles.map(article => {
      // Format date: 2024.05.21 -> 05.21 for display
      let displayDate = article.date || '';
      if (/^\d{4}\.\d{2}\.\d{2}$/.test(displayDate)) {
        displayDate = displayDate.substring(5);
      }

      return {
        ...article,
        // If title looks like a URL, try to make it prettier (though model should have handled this)
        title: article.title.startsWith('http') ? '관련 기사 (제목 없음)' : article.title,
        date: displayDate,
        source: article.source || 'News'
      };
    });

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};