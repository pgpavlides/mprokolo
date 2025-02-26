// app/lib/components/CategoryCard.js
import { useState } from 'react';
import { FolderOpen, Link as LinkIcon } from 'lucide-react';
import { renderIcon } from './categories-management/icons';

const CategoryCard = ({ category, linkCount, onCategorySelect, tabIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCategorySelect(category.name);
    }
  };
  
  return (
    <div
      className={`relative h-40 bg-black border rounded-lg overflow-hidden group cursor-pointer flex flex-col
                 ${isFocused ? 'border-green-400 ring-2 ring-green-500/50' : 'border-green-800'}`}
      onClick={() => onCategorySelect(category.name)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={tabIndex || 0}
      role="button"
      aria-label={`Category ${category.name} with ${linkCount} links`}
      onKeyDown={handleKeyDown}
    >
      {/* Top section: Icon container */}
      <div className="relative h-28 overflow-hidden bg-green-900/20 flex items-center justify-center">
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-green-500 w-16 h-16 flex items-center justify-center">
            {category.icon ? (
              <div className="w-full h-full flex items-center justify-center">
                {renderIcon(category.icon)}
              </div>
            ) : (
              <FolderOpen className="w-full h-full" />
            )}
          </div>
        </div>

        <div className={`absolute inset-0 transition-opacity bg-black/50 flex items-center justify-center 
                        ${(isHovered || isFocused) ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-white text-xs">Open Category</span>
        </div>
      </div>

      {/* Bottom section: Data box */}
      <div className="flex-grow bg-green-900/80 p-1.5 flex flex-col items-center justify-center">
        <h3 className="text-white text-sm font-medium truncate text-center w-full">{category.name}</h3>
        <div className="flex items-center gap-1 text-green-300 text-xs">
          <LinkIcon className="w-3 h-3" />
          <span>{linkCount}</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;