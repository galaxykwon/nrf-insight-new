// api/naver.js
export default async function handler(req, res) {
  // 1. 요청에서 검색어 가져오기
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // 2. 네이버 API 호출 (환경변수 사용)
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  
  // display=10: 기사 10개, sort=date: 최신순
  const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });

    const data = await response.json();
    
    // 3. 결과 반환
    if (response.status === 200) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({ error: 'Naver API Error' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
}
