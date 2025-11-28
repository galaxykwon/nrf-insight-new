import React, { useState, useEffect, useCallback } from 'react';
import { SECTIONS } from './constants';
import { NewsArticle, SectionType } from './types';
import { fetchNewsForTopic } from './services/geminiService';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import NewsCard from './components/NewsCard';
import SkeletonLoader from './components/SkeletonLoader';

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<SectionType>(SectionType.NRF_NEWS);
  const [newsData, setNewsData] = useState<Record<SectionType, NewsArticle[]>>({
    [SectionType.NRF_NEWS]: [],
    [SectionType.SCI_TECH]: [],
    [SectionType.HUMANITIES]: [],
    [SectionType.UNI_SUPPORT]: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeSection = SECTIONS.find(s => s.id === activeSectionId) || SECTIONS[0];

  const loadNews = useCallback(async (sectionId: SectionType, forceRefresh = false) => {
    // If we already have data and not forcing refresh, don't fetch
    if (!forceRefresh && newsData[sectionId].length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const articles = await fetchNewsForTopic(section.searchQuery);
      setNewsData(prev => ({
        ...prev,
        [sectionId]: articles
      }));
    } catch (err) {
      setError("뉴스 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [newsData]);

  // Initial load when tab changes
  useEffect(() => {
    loadNews(activeSectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId]);

  const handleRefresh = () => {
    loadNews(activeSectionId, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Container to simulate mobile width on desktop */}
      <div className="w-full max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl shadow-gray-200">
        
        <Header 
          currentSection={activeSection} 
          onRefresh={handleRefresh} 
          isLoading={loading} 
        />

        <main className="flex-1 pb-20 overflow-y-auto no-scrollbar">
          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
              {error}
              <button 
                onClick={handleRefresh}
                className="block mx-auto mt-2 text-red-800 underline font-semibold"
              >
                다시 시도
              </button>
            </div>
          )}

          {loading && newsData[activeSectionId].length === 0 ? (
            <SkeletonLoader />
          ) : (
            <div className="p-4 space-y-3">
              {newsData[activeSectionId].length > 0 ? (
                newsData[activeSectionId].map((article, index) => (
                  <NewsCard key={`${article.url}-${index}`} article={article} />
                ))
              ) : (
                !loading && !error && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <p>관련된 최신 뉴스가 없습니다.</p>
                  </div>
                )
              )}
            </div>
          )}
          
          {/* Add padding at bottom for content not to be hidden by nav */}
          <div className="h-4"></div>
        </main>

        <BottomNav 
          activeSection={activeSectionId} 
          onSectionChange={setActiveSectionId} 
        />
      </div>
    </div>
  );
};

export default App;
