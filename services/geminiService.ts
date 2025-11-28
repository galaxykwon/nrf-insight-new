import { GoogleGenerativeAI } from "@google/generative-ai";
import { NewsArticle } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// 1. 구글 뉴스 RSS를 가져오는 함수 (CORS 우회)
async function fetchGoogleNewsRSS(query: string) {
  // 'when:7d'를 붙여서 최근 7일 기사만 가져옴
  const encodedQuery = encodeURIComponent(`${query} when:7d`);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ko&gl=KR&ceid=KR:ko`;
  
  // CORS 문제 해결을 위해 프록시 사용
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    return data.contents; // XML 형식의 뉴스 데이터
  } catch (error) {
    console.error("RSS Fetch Error:", error);
    return null;
  }
}

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // 2. 먼저 최신 뉴스를 긁어옵니다.
    const rssData = await fetchGoogleNewsRSS(topicQuery);

    if (!rssData) {
      throw new Error("뉴스를 가져올 수 없습니다.");
    }

    // 3. AI에게 긁어온 데이터를 주고 정리를 시킵니다.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Here is a raw XML/RSS data of news articles:
      """
      ${rssData.substring(0, 15000)} 
      """
      
      TASK:
      1. Extract the top 6 most relevant news items about "${topicQuery}" from the data above.
      2. Ignore old news if possible.
      3. Format strictly as a JSON array.
      
      JSON keys:
      - "title": Clean Korean headline (remove '... - Media Name' part).
      - "date": Date in 'YYYY.MM.DD' format.
      - "source": Press/Media name.
      - "url": Article link.
      - "snippet": Summarize the headline into 1 simple Korean sentence.
      
      Return ONLY JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. JSON 파싱 및 정리
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
    console.error("Final News Error:", error);
    // 에러나면 빈 배열 반환
    return [];
  }
};
