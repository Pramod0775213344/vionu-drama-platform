'use client';

import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface TagFilterBarProps {
  onSelectTag?: (tag: string) => void;
}

const TAGS = [
  { id: 'all', label: 'All Videos', icon: true },
  { id: 'china', label: 'Chinese Mainland' },
  { id: 'korea', label: 'South Korea' },
  { id: 'thailand', label: 'Thailand' },
  { id: 'taiwan', label: 'Taiwan' },
  { id: 'japan', label: 'Japan' },
  { id: 'malaysia', label: 'Malaysia' },
  { id: 'america', label: 'America' },
  { id: 'uk', label: 'UK' },
  { id: 'youth', label: 'Youth' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'lgbt', label: 'LGBT' },
  { id: 'costume', label: 'Costume' },
  { id: 'urban', label: 'Urban' },
  { id: 'romance', label: 'Romance' },
  { id: 'sweet', label: 'Sweet Love' },
  { id: 'marriage', label: 'Marriage' },
];

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ onSelectTag }) => {
  const [activeTag, setActiveTag] = useState('all');

  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId);
    if (onSelectTag) onSelectTag(tagId);
  };

  return (
    <div className="w-full my-6 overflow-x-auto scrollbar-none py-1 px-4 sm:px-8">
      <div className="flex items-center gap-2.5 min-w-max">
        {TAGS.map((tag) => {
          const isActive = activeTag === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#262A37] text-white border border-slate-600 shadow-md font-bold'
                  : 'bg-[#1C1F2B] text-slate-400 hover:text-slate-200 hover:bg-[#232736]'
              }`}
            >
              {tag.icon && <Film className="w-3.5 h-3.5 text-slate-300" />}
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

