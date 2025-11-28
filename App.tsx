import React, { useState, useEffect } from 'react';
import { fetchNewsForTopic } from './services/geminiService';
import { NewsArticle } from './types'; // types.ts 파일이 있다고 가정

// [핵심] 요청하신 검색어 조합 (OR 검색 적용)
const SECTIONS = {
  NRF: { 
    id: 'NRF', 
    label: '재단소식', 
    query: '한국연구재단' 
  },
  SCI: { 
    id: 'SCI', 
    label: '과기동향', 
    query: '과학기술정보통신부 R&D' 
  },
  HUM: { 
    id: 'HUM', 
    label: '인문동향', 
    query: '인문사회연구 | 인문학 | 사회과학' 
  },
  UNI: { 
    id: 'UNI', 
    label: '대학지원', 
    query: '대학재정지원사업 | RISE | 글로컬대학 | 대학혁신지원사업 | 교원창업 | COSS | HUSS' 
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('NRF');
  // 뉴스 데이터 타입 정의
  const [news, setNews] = useState<Record<string, NewsArticle[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const loadNews = async (tabId: string) => {
    // 이미 불러온 데이터가 있으면 패스 (새로고침 제외)
    if (news[tabId]) return;

    setLoading(true);
    try {
      // @ts-ignore (SECTIONS 인덱싱 에러 방지)
      const query = SECTIONS[tabId as keyof typeof SECTIONS].query;
      const articles = await fetchNewsForTopic(query);
      setNews(prev => ({ ...prev, [tabId]: articles }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    setNews(prev => {
      const newState = { ...prev };
      delete newState[activeTab];
      return newState;
    });
    loadNews(activeTab);
  };

  // 현재 선택된 탭의 정보
  const currentSection = SECTIONS[activeTab as keyof typeof SECTIONS];

  return (
    <div className="app-container">
      {/* 헤더 */}
      <div className="header">
        <div>
          <div style={{fontSize: '12px', color: '#888', fontWeight: 'bold'}}>KOREA RESEARCH FOUNDATION</div>
          <h1 style={{margin: 0, fontSize: '24px', color: '#1a1f27'}}>NRF Insight</h1>
        </div>
        <img src="https://www.nrf.re.kr/resources/img/contents/character/nulph_intro.png" style={{width: '45px', borderRadius: '50%'}} alt="mascot" />
      </div>

      {/* 탭 버튼들 */}
      <div className="tab-container">
        {Object.values(SECTIONS).map(section => (
          <button 
            key={section.id}
            className={`tab-btn ${activeTab === section.id ? 'active' : ''}`}
            onClick={() => setActiveTab(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* 새로고침 버튼 */}
      <button className="refresh-btn" onClick={handleRefresh}>
        🔄 {currentSection.label} 새로고침
      </button>

      {/* 뉴스 리스트 영역 */}
      {loading && !news[activeTab] ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#3182F6'}}>
          최신 뉴스를 불러오고 있습니다...
        </div>
      ) : (
        <div>
          {news[activeTab]?.map((item, idx) => (
            <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="news-card">
              <div>
                <span className="tag">{item.source}</span>
                <span className="date">{item.date}</span>
              </div>
              <h3 className="title" dangerouslySetInnerHTML={{__html: item.title}}></h3>
              <p className="snippet" dangerouslySetInnerHTML={{__html: item.snippet}}></p>
            </a>
          ))}
          {news[activeTab]?.length === 0 && (
            <div style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>
              관련된 최신 뉴스가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
