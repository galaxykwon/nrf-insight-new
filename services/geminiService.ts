import { GoogleGenAI } from "@google/genai";
import { NewsArticle } from "../types";

// [수정 1] process.env 대신 Vite 방식인 import.meta.env 사용
// (만약 에러가 계속 나면 이 줄을 const ai = new GoogleGenAI({ apiKey: "내_긴_API_키_직접_입력" }); 으로 바꾸셔도 됩니다)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey });

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
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
      // [수정 2] 모델명을 공개된 최신 버전인 1.5-flash로 변경 (2.5는 에러 날 수 있음)
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });

    const text = response.text || "";
    
    // Clean up markdown if present
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    let articles: NewsArticle[] = [];
    
    try {
      articles = JSON.parse(cleanText);
    } catch (e) {
      console.warn("Failed to parse JSON, trying grounding metadata", e);
      // Fallback logic
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

    // Sort by date
    articles.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });

    // Post-processing
    return articles.map(article => {
      let displayDate = article.date || '';
      if (/^\d{4}\.\d{2}\.\d{2}$/.test(displayDate)) {
        displayDate = displayDate.substring(5);
      }

      return {
        ...article,
        title: article.title.startsWith('http') ? '관련 기사' : article.title,
        date: displayDate,
        source: article.source || 'News'
      };
    });

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};
