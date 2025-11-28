import { NewsArticle } from "../types";

export const fetchNewsForTopic = async (topicQuery: string): Promise<NewsArticle[]> => {
  try {
    // 1. 네이버와 구글 동시 요청
    const [naverResponse, googleResponse] = await Promise.all([
      fetch(`/api/naver?query=${encodeURIComponent(topicQuery)}`),
      fetch(`/api/google?query=${encodeURIComponent(topicQuery)}`)
    ]);

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
            source: "Naver News",
            date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10).replace(/-/g, '.') : "",
            snippet: cleanHtml(item.description)
          };
        });
        mergedArticles = [...mergedArticles, ...naverArticles];
      }
    }

    // [B] 구글 뉴스 처리
    if (googleResponse.ok) {
      const xmlText = await googleResponse.text();
      const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
      
      const googleArticles = items.slice(0, 10).map(itemXml => {
        const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
        const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
        const sourceMatch = itemXml.match(/<source url=".*?">(.*?)<\/source>/);

        const title = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '') : '';
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
          snippet: title
        };
      });
      mergedArticles = [...mergedArticles, ...googleArticles];
    }

    // [C] ★★★ 엄격한 필터링 추가 (여기가 핵심!) ★★★
    // 검색어가 '한국연구재단'을 포함하고 있다면, 결과물에도 반드시 그 단어가 있어야 함
    if (topicQuery.includes('한국연구재단')) {
      mergedArticles = mergedArticles.filter(article => {
        const titleHasIt = article.title.includes('한국연구재단');
        const snippetHasIt = article.snippet.includes('한국연구재단');
        return titleHasIt || snippetHasIt;
      });
    }

    // 3. 중복 제거
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
