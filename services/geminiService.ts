import { NewsArticle } from "../types";

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // 1. 네이버와 구글, 두 곳에 동시에 요청을 보냅니다 (병렬 처리)
    const [naverResponse, googleResponse] = await Promise.all([
      fetch(`/api/naver?query=${encodeURIComponent(topicQuery)}`),
      fetch(`/api/google?query=${encodeURIComponent(topicQuery)}`)
    ]);

    // 2. 각각의 결과를 처리합니다.
    let mergedArticles: NewsArticle[] = [];

    // [A] 네이버 뉴스 처리
    if (naverResponse.ok) {
      const naverData = await naverResponse.json();
      if (naverData.items) {
        const naverArticles = naverData.items.map((item: any) => {
          const cleanHtml = (text: string) => text.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          return {
            title: cleanHtml(item.title),
            url: item.link,
            source: "Naver News", // 출처 표시
            date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10).replace(/-/g, '.') : "",
            snippet: cleanHtml(item.description)
          };
        });
        mergedArticles = [...mergedArticles, ...naverArticles];
      }
    }

    // [B] 구글 뉴스 처리 (RSS XML 파싱)
    if (googleResponse.ok) {
      const xmlText = await googleResponse.text();
      // 간단한 XML 파싱 (Regex 사용)
      const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
      
      const googleArticles = items.slice(0, 5).map(itemXml => { // 상위 5개만
        const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
        const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
        const sourceMatch = itemXml.match(/<source url=".*?">(.*?)<\/source>/);

        const title = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '') : '';
        // 구글 뉴스는 제목 뒤에 ' - 언론사명'이 붙는 경우가 많아 제거
        const cleanTitle = title.split(' - ')[0]; 
        
        let date = "";
        if (dateMatch) {
          try {
            date = new Date(dateMatch[1]).toISOString().slice(0, 10).replace(/-/g, '.');
          } catch (e) {}
        }

        return {
          title: cleanTitle,
          url: linkMatch ? linkMatch[1] : '#',
          source: sourceMatch ? sourceMatch[1] : 'Google News',
          date: date,
          snippet: title // 구글 RSS는 요약이 없어서 제목을 사용하거나 비워둠
        };
      });
      
      mergedArticles = [...mergedArticles, ...googleArticles];
    }

    // 3. 중복 제거 (제목이 완전히 같은 경우)
    const uniqueArticles = mergedArticles.filter((article, index, self) =>
      index === self.findIndex((t) => (
        t.title === article.title
      ))
    );

    // 4. 최신순 정렬
    uniqueArticles.sort((a, b) => {
      return b.date.localeCompare(a.date);
    });

    return uniqueArticles;

  } catch (error) {
    console.error("News Fetch Error:", error);
    return [];
  }
};
