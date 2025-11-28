// api/google.js
export default async function handler(req, res) {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // 구글 뉴스 RSS 주소 (한국어 설정)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:7d')}&hl=ko&gl=KR&ceid=KR:ko`;
    
    // 서버에서 직접 요청 (CORS 해결)
    const response = await fetch(rssUrl);
    const xmlData = await response.text();

    res.status(200).send(xmlData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Google news' });
  }
}
