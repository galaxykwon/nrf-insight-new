import React, { useState, useEffect } from 'react';
import { fetchNewsForTopic } from './services/geminiService';
import { NewsArticle } from './types';

// [1] 검색어 설정 (성공한 OR 검색 키워드 유지)
const SECTIONS = [
  { id: 'NRF', label: '재단소식', query: '한국연구재단', icon: '🏢' },
  { id: 'SCI', label: '과기동향', query: '과학기술정보통신부 R&D', icon: '⚛️' },
  { id: 'HUM', label: '인문동향', query: '인문사회연구 | 인문학 | 사회과학', icon: '📖' },
  { id: 'UNI', label: '대학지원', query: '대학재정지원사업 | RISE | 글로컬대학 | 대학혁신지원사업 | 교원창업 | COSS | HUSS', icon: '🎓' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('NRF');
  const [news, setNews] = useState<Record<string, NewsArticle[]>>({});
  const [loading, setLoading] = useState(false);

  const loadNews = async (tabId: string) => {
    if (news[tabId]) return;

    setLoading(true);
    try {
      const target = SECTIONS.find(s => s.id === tabId);
      if (target) {
        const articles = await fetchNewsForTopic(target.query);
        setNews(prev => ({ ...prev, [tabId]: articles }));
      }
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

  const currentSection = SECTIONS.find(s => s.id === activeTab) || SECTIONS[0];

  return (
    // 전체 배경 및 폰트 설정
    <div className="min-h-screen bg-[#F2F4F6] font-sans text-gray-900 pb-24">
      
      {/* --- 헤더 (고정) --- */}
      <div className="bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-0 z-50 flex justify-between items-center rounded-b-3xl">
        <div>
          <div className="text-[11px] font-bold text-gray-400 mb-0.5 tracking-wide">KOREA RESEARCH FOUNDATION</div>
          <h1 className="text-2xl font-black text-[#1a1f27] tracking-tight">NRF Insight</h1>
        </div>
        <img 
          src="https://www.nrf.re.kr/resources/img/contents/character/nulph_intro.png" 
          alt="mascot" 
          className="w-11 h-11 rounded-full border border-gray-100 shadow-sm bg-gray-50"
        />
      </div>

      {/* --- 메인 컨텐츠 --- */}
      <main className="max-w-md mx-auto p-5">
        
        {/* 상단 탭 제목 & 새로고침 */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <span className="text-2xl">{currentSection.icon}</span> {currentSection.label}
          </h2>
          <button 
            onClick={handleRefresh}
            className="text-xs font-bold bg-white text-blue-600 px-3 py-1.5 rounded-full shadow-sm border border-blue-100 hover:bg-blue-50 active:scale-95 transition-all"
          >
            🔄 새로고침
          </button>
        </div>

        {/* 로딩 스켈레톤 UI */}
        {loading && !news[activeTab] && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-[20px] p-5 shadow-sm animate-pulse h-32 border border-white">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* 뉴스 리스트 */}
        <div className="space-y-4">
          {news[activeTab]?.map((item, idx) => (
            <a 
              key={idx} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-white hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
            >
              {/* 메타 정보 (언론사, 날짜) */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  {item.source}
                </span>
                <span className="text-[11px] font-medium text-gray-400">{item.date}</span>
              </div>
              
              {/* 제목 */}
              <h3 
                className="text-[17px] font-bold text-[#191F28] leading-[1.4] mb-2 break-keep"
                dangerouslySetInnerHTML={{__html: item.title}}
              ></h3>
              
              {/* 요약 */}
              <p 
                className="text-[13px] text-[#4E5968] leading-relaxed line-clamp-2"
                dangerouslySetInnerHTML={{__html: item.snippet}}
              ></p>
            </a>
          ))}
        </div>

        {/* 결과 없음 */}
        {!loading && news[activeTab]?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[20px] border border-dashed border-gray-200 mt-4 shadow-sm">
            <span className="text-4xl mb-3">📭</span>
            <p className="font-medium">관련된 최신 뉴스가 없습니다.</p>
          </div>
        )}
      </main>

      {/* --- 하단 탭바 (Bottom Nav) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-1 px-6 flex justify-between items-center z-50 h-[80px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] rounded-t-3xl">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className="flex flex-col items-center justify-center w-full h-full gap-1.5 active:scale-90 transition-transform"
          >
            <span className={`text-2xl transition-all duration-300 ${activeTab === section.id ? '-translate-y-1 drop-shadow-md' : 'grayscale opacity-40'}`}>
              {section.icon}
            </span>
            <span className={`text-[10px] font-bold transition-colors ${activeTab === section.id ? 'text-[#1a1f27]' : 'text-gray-300'}`}>
              {section.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default App;
