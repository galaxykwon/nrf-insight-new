import React from 'react';
import { SECTIONS } from '../constants';
import { SectionType } from '../types';
import { getIcon } from './Icons';

interface BottomNavProps {
  activeSection: SectionType;
  onSectionChange: (sectionId: SectionType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeSection, onSectionChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-between px-2">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${
                isActive ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {getIcon(section.iconName, isActive ? "w-6 h-6 stroke-2" : "w-6 h-6 stroke-1.5")}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {section.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
