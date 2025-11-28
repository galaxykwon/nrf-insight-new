import React from 'react';
import { SectionConfig } from '../types';
import { IconRefresh } from './Icons';

interface HeaderProps {
  currentSection: SectionConfig;
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentSection, onRefresh, isLoading }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm safe-top">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex-1 pr-2">
          <h1 className="text-xl font-black text-blue-900 leading-none tracking-tight">
            NRF Insight
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1 line-clamp-1">
            {currentSection.label}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isLoading ? 'opacity-50' : ''}`}
            aria-label="Refresh news"
          >
            <div className={`${isLoading ? 'animate-spin' : ''}`}>
               <IconRefresh className="w-5 h-5 text-gray-500" />
            </div>
          </button>
          <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src="https://www.nrf.re.kr/resources/img/contents/character/nulph_intro.png" 
              alt="늘프" 
              className="w-full h-full object-cover object-top transform scale-125 pt-1"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;