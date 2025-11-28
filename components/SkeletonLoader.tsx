import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
