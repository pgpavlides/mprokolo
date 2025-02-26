// app/lib/components/LinkGrid.js
import { useRef, useState, useEffect } from 'react';
import LinkCard from './LinkCard';
import { CheckSquare } from 'lucide-react';

const GRID_COLUMNS = {
  mobile: 2,
  tablet: 3,
  desktop: 6 
};

const LinkGrid = ({ links, editMode, selectedLinks, onLinkSelect, onEditLink }) => {
  const gridRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [gridColumns, setGridColumns] = useState(GRID_COLUMNS.desktop);

  // Update grid columns on window resize
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setGridColumns(GRID_COLUMNS.mobile);
      } else if (width < 1024) {
        setGridColumns(GRID_COLUMNS.tablet);
      } else {
        setGridColumns(GRID_COLUMNS.desktop);
      }
    };
    
    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  // Reset focused index when links change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [links]);

  // Generate a unique ID if none exists
  const ensureUniqueId = (link) => {
    if (!link.id || typeof link.id === 'number') {
      return {
        ...link,
        id: `link_${link.name}_${link.link}_${Date.now()}`
      };
    }
    return link;
  };

  // Handle arrow key navigation
  const handleKeyDown = (e) => {
    if (links.length === 0) return;
    
    // Only handle arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
    
    // Calculate the new focused index based on arrow key
    let newIndex = focusedIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(0, focusedIndex - gridColumns);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(links.length - 1, focusedIndex + gridColumns);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(links.length - 1, focusedIndex + 1);
        break;
      case 'Tab':
        // Let Tab handle focus naturally
        return;
    }
    
    // Update focused index if changed
    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      
      // Focus the new element
      const cards = gridRef.current?.querySelectorAll('[role="link"]');
      if (cards && cards[newIndex]) {
        cards[newIndex].focus();
      }
    }
  };

  // Set up event listener for arrow key navigation
  useEffect(() => {
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (gridElement) {
        gridElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [focusedIndex, links.length, gridColumns]);

  return (
    <div 
      className="w-full max-w-6xl mx-auto mb-8"
      ref={gridRef}
      tabIndex="-1" // Make it focusable but not in tab order
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((link, index) => {
          const linkWithId = ensureUniqueId(link);
          const isSelected = editMode && selectedLinks.has(linkWithId.id);
          
          return (
            <div
              key={linkWithId.id}
              onClick={() => onLinkSelect(linkWithId.id)}
              className={`relative cursor-pointer transition-transform duration-200 ${
                isSelected ? 'scale-95' : ''
              }`}
            >
              <LinkCard 
                link={linkWithId} 
                editMode={editMode} 
                onEdit={onEditLink}
                tabIndex={index === 0 ? 0 : -1} // Only first card is in tab order
              />
              {isSelected && (
                <>
                  <div className="absolute inset-0 bg-green-500/30 pointer-events-none"></div>
                  <div className="absolute top-2 right-2">
                    <CheckSquare className="w-5 h-5 text-green-400" />
                  </div>
                </>
              )}
            </div>
          );
        })}
        {links.length === 0 && (
          <div className="col-span-full text-center text-green-600 py-8">
            No links found
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkGrid;