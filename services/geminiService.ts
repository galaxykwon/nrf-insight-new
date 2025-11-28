import { NewsArticle } from "../types";

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // 1. 우리가 만든 Vercel 서버(네이버 API 중계) 호출
    const response = await fetch(`/api/naver?query=${encodeURIComponent(topicQuery)}`);
    const data = await response.json();

    if (!data.items) {
      return [];
    }

    // 2. 네이버 데이터(JSON)를 우리 앱 형식에 맞게 변환
    // (네이버는 HTML 태그(<b> 등)를 섞어서 주기 때문에 지워줘야 함)
    const articles = data.items.map((item: any) => {
      // HTML 태그 제거 함수
      const cleanHtml = (text: string) => text.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      
      return {
        title: cleanHtml(item.title),
        url: item.link, // 네이버는 'link'가 기사 주소입니다
        source: "Naver News", // 네이버 API는 언론사 이름을 따로 안 줘서 고정
        date: new Date(item.pubDate).toISOString().slice(0, 10).replace(/-/g, '.'), // 'Fri, 28 Nov...' -> '2025.11.28'
        snippet: cleanHtml(item.description)
      };
    });

    return articles;

  } catch (error) {
    console.error("Naver News Error:", error);
    return [];
  }
};
