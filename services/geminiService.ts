import { GoogleGenerativeAI } from "@google/generative-ai"; // 정식 SDK로 변경됨
import { NewsArticle } from "../types";

// 1. Vercel 환경 변수에서 API 키 가져오기
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. 정식 SDK 초기화 (문법이 다릅니다)
const genAI = new GoogleGenerativeAI(apiKey);

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // 3. 모델 설정 (가장 안정적인 1.5-flash 사용)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. 프롬프트: JSON 형식으로만 달라고 강력하게 요청
    const prompt = `
      You are a news assistant. 
      Based on your knowledge, provide 6 latest or relevant news headlines about "${topicQuery}".
      
      CRITICAL INSTRUCTION: Return a RAW JSON array. Do not use Markdown.
      
      Format:
      [
        {
          "title": "Korean Headline",
          "date": "YYYY.MM.DD",
          "source": "News Source Name",
          "url": "#", 
          "snippet": "1 sentence summary in Korean"
        }
      ]
    `;

    // 5. 요청 보내기 (tools 설정 없이 순수 AI 기능 사용 -> 에러 방지)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. 결과 정리 (Markdown 기호 제거)
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    // 7. JSON 변환
    const articles = JSON.parse(cleanText);

    // 8. 데이터 타입 맞추기
    return articles.map((article: any) => ({
      title: article.title,
      url: article.url || '#', // URL이 없으면 # 처리 (클릭 방지)
      source: article.source || 'AI Summary',
      date: article.date || new Date().toISOString().slice(0, 10),
      snippet: article.snippet
    }));

  } catch (error) {
    console.error("News Fetch Error:", error);
    // 에러 발생 시 빈 배열 반환 (화면이 하얗게 죽는 것 방지)
    return [];
  }
};
