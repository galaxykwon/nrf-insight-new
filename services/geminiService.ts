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

    // [C] 기존 필터: 한국연구재단
    if (topicQuery.includes('한국연구재단')) {
      mergedArticles = mergedArticles.filter(article => {
        return article.title.includes('한국연구재단') || article.snippet.includes('한국연구재단');
      });
    }

    // [D] ★★★ 신규 필터: RISE (대학/지역 문맥 체크) ★★★
    // 쿼리에 'RISE'가 포함된 경우에만 작동
    if (topicQuery.includes('RISE')) {
      mergedArticles = mergedArticles.filter(article => {
        // 제목과 내용을 합쳐서 대문자로 변환 (검사하기 쉽게)
        const fullText = (article.title + " " + article.snippet).toUpperCase();
        
        // 기사에 'RISE'나 '라이즈'라는 단어가 있다면?
        if (fullText.includes('RISE') || fullText.includes('라이즈')) {
          // 반드시 아래 단어 중 하나라도 같이 있어야 합격! (듀스, 아이돌 제외 목적)
          const mustHave = ['대학', '지역', '지자체', '교육', '공모', '사업', '지원', '혁신'];
          const hasContext = mustHave.some(keyword => fullText.includes(keyword));
          return hasContext;
        }
        
        // RISE 관련 기사가 아니면(글로컬 등 다른 키워드면) 통과
        return true;
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
