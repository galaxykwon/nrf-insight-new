import { GoogleGenerativeAI } from "@google/generative-ai";
import { NewsArticle } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // 1. 우리가 만든 Vercel 서버 API('/api/news')를 호출합니다.
    // (이제 CORS 에러가 나지 않습니다!)
    const response = await fetch(`/api/news?query=${encodeURIComponent(topicQuery)}`);
    
    if (!response.ok) {
      throw new Error("뉴스 데이터를 가져올 수 없습니다.");
    }
    
    const rssData = await response.text();

    // 2. AI에게 뉴스 정리를 시킵니다.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Here is a raw XML/RSS data of Korean news:
      """
      ${rssData.substring(0, 20000)} 
      """
      
      TASK:
      1. Analyze the content and extract top 6 news articles related to "${topicQuery}".
      2. If the query is about specific government projects (Rise, Glocal, R&D), prioritize those.
      3. Return a RAW JSON array.
      
      JSON Keys:
      - "title": Headline (Remove media name suffix like ' - Chosun').
      - "date": 'YYYY.MM.DD' format.
      - "source": Media/Press name.
      - "url": Original link.
      - "snippet": 1 sentence summary in Korean.
      
      CRITICAL: Return ONLY JSON. No Markdown.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

    // JSON 파싱
    const cleanText = text.replace(/```json|```/g, '').trim();
    const articles = JSON.parse(cleanText);

    return articles.map((article: any) => ({
      title: article.title,
      url: article.url || '#',
      source: article.source || 'News',
      date: article.date,
      snippet: article.snippet
    }));

  } catch (error) {
    console.error("News Fetch Error:", error);
    return []; // 에러 시 빈 배열 반환
  }
};
