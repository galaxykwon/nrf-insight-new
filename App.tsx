import React, { useState, useEffect } from 'react';
import { fetchNewsForTopic } from './services/geminiService';
import { NewsArticle } from './types';

// 검색어 설정 (성공한 OR 검색 키워드 유지)
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

  // [수정됨] isRefresh 파라미터 추가 (true면 무조건 새로 가져옴)
  const loadNews = async (tabId: string, isRefresh = false) => {
    // 이미 데이터가 있고(news[tabId]), 강제 새로고침(isRefresh)이 아니면? -> 중단
    if (news[tabId] && !isRefresh) return;

    setLoading(true);
    try {
      const target = SECTIONS.find(s => s.id === tabId);
      if (target) {
        // 기존 데이터가 있어도 새로고침 때는 잠깐 로딩 보여주기 위해 상태 유지 or 비우기 선택 가능
        // 여기서는 자연스러운 교체를 위해 기존 데이터 유지하며 로딩 표시
        const articles = await fetchNewsForTopic(target.query);
        setNews(prev => ({ ...prev, [tabId]: articles }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 탭이 바뀔 때는 '강제 새로고침 없이' 호출 (캐시된 거 있으면 그거 보여줌)
  useEffect(() => {
    loadNews(activeTab, false);
  }, [activeTab]);

  // [수정됨] 새로고침 버튼 누르면 'true'를 넣어서 강제로 가져오게 함
  const handleRefresh = () => {
    loadNews(activeTab, true);
  };

  const currentSection = SECTIONS.find(s => s.id === activeTab) || SECTIONS[0];

  return (
    <div className="min-h-screen bg-[#F2F4F6] font-sans text-gray-900 pb-24">
      
      {/* --- 헤더 --- */}
      <div className="bg-white px-5 py-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-50 flex justify-between items-center rounded-b-[24px]">
        <div>
          <div className="text-[11px] font-bold text-blue-600 mb-0.5 tracking-wide uppercase">National Research Foundation of Korea</div>
          <h1 className="text-[26px] font-black text-[#191F28] tracking-tight leading-none">NRF Insight</h1>
        </div>
        <img 
          src="https://www.nrf.re.kr/resources/img/contents/character/nulph_intro.png" 
          alt="mascot" 
          className="w-11 h-11 rounded-full border border-gray-100 shadow-sm bg-gray-50 object-cover"
        />
      </div>

      {/* --- 메인 컨텐츠 --- */}
      <main className="max-w-md mx-auto p-4 md:p-5">
        
        {/* 상단 탭 제목 & 새로고침 */}
        <div className="flex items-center justify-between mb-4 px-1 mt-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <span className="text-2xl">{currentSection.icon}</span> {currentSection.label}
          </h2>
          <button 
            onClick={handleRefresh}
            className="text-[13px] font-bold bg-white text-blue-600 px-3.5 py-1.5 rounded-full shadow-sm border border-blue-100 hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1"
          >
            {/* 로딩 중이면 아이콘 뱅글뱅글 돌기 */}
            <span className={loading ? "animate-spin" : ""}>🔄</span> 새로고침
          </button>
        </div>

        {/* 로딩 스켈레톤 (데이터가 아예 없거나, 로딩 중일 때 표시) */}
        {loading && (!news[activeTab] || news[activeTab].length === 0) && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[22px] p-5 shadow-sm animate-pulse h-36 border border-white">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* 뉴스 리스트 */}
        <div className={`space-y-4 ${loading && news[activeTab] ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
          {news[activeTab]?.map((item, idx) => (
            <a 
              key={idx} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white rounded-[22px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-transparent active:border-blue-200 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-extrabold text-[#3182F6] bg-blue-50 px-2 py-1 rounded-[6px]">
                  {item.source}
                </span>
                <span className="text-[12px] font-medium text-gray-400">{item.date}</span>
              </div>
              <h3 
                className="text-[18px] font-bold text-[#191F28] leading-snug mb-2.5 break-keep"
                dangerouslySetInnerHTML={{__html: item.title}}
              ></h3>
              <p 
                className="text-[15px] text-[#4E5968] leading-relaxed line-clamp-3"
                dangerouslySetInnerHTML={{__html: item.snippet}}
              ></p>
            </a>
          ))}
        </div>

        {/* 결과 없음 */}
        {!loading && news[activeTab]?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[22px] border border-dashed border-gray-200 mt-4 shadow-sm">
            <span className="text-4xl mb-3">📭</span>
            <p className="font-medium text-gray-500">관련된 최신 뉴스가 없습니다.</p>
          </div>
        )}
      </main>

      {/* --- 하단 탭바 --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-1 px-4 flex justify-between items-center z-50 h-[84px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] rounded-t-[24px]">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
          >
            <span className={`text-[26px] transition-all duration-300 ${activeTab === section.id ? '-translate-y-1 drop-shadow-md scale-110' : 'grayscale opacity-40'}`}>
              {section.icon}
            </span>
            <span className={`text-[11px] font-bold transition-colors ${activeTab === section.id ? 'text-[#191F28]' : 'text-gray-300'}`}>
              {section.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
