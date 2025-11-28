import { GoogleGenerativeAI } from "@google/generative-ai";
import { NewsArticle } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  // 1. 구글 뉴스 RSS URL (최근 7일)
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topicQuery + ' when:7d')}&hl=ko&gl=KR&ceid=KR:ko`;
  
  // 2. 우회 서버(AllOrigins)를 통해 접속 (CORS 차단 해결!)
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

  try {
    // 3. 뉴스 데이터 가져오기
    const response = await fetch(proxyUrl);
    let rawData = "";

    if (response.ok) {
      rawData = await response.text();
    } else {
      console.warn("우회 접속 실패, AI 지식으로 대체합니다.");
    }

    // 4. AI에게 정리 시키기
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a news curator.
      
      SOURCE DATA (XML/RSS):
      """
      ${rawData.substring(0, 20000)}
      """

      INSTRUCTIONS:
      1. If SOURCE DATA contains news items, extract the top 6 real news articles about "${topicQuery}".
      2. If SOURCE DATA is empty or invalid, generate 6 realistic news headlines based on your internal knowledge about "${topicQuery}" (mark source as "AI Summary").
      3. Focus on official announcements, R&D, and policy changes.
      
      OUTPUT FORMAT (Raw JSON Array only):
      [
        {
          "title": "Headline in Korean",
          "date": "YYYY.MM.DD",
          "source": "Press Name",
          "url": "Article URL (or #)",
          "snippet": "1 sentence summary in Korean"
        }
      ]
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
      source: article.source || 'AI News',
      date: article.date || new Date().toISOString().slice(0, 10),
      snippet: article.snippet
    }));

  } catch (error) {
    console.error("News Fetch Error:", error);
    // 최악의 경우에도 빈 화면 대신 에러를 보여주지 않기 위해 빈 배열 반환
    return [];
  }
};
