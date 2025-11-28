import React from 'react';
import { NewsArticle } from '../types';
import { IconLink } from './Icons';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <a 
      href={article.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-white p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-md transition-all active:scale-[0.99] active:bg-gray-50"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[120px]">
              {article.source || 'News'}
            </span>
            {article.date && (
              <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">
                {article.date}
              </span>
            )}
          </div>
          <IconLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        </div>
        
        <h3 className="text-[16px] font-bold text-gray-800 leading-snug break-keep line-clamp-2">
          {article.title}
        </h3>
        
        {article.snippet && (
           <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
             {article.snippet}
           </p>
        )}
      </div>
    </a>
  );
};

export default NewsCard;