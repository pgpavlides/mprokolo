// app/lib/components/CategoryGrid.js - Update to support external page control
import { useState, useEffect, useMemo, useRef } from 'react';
import CategoryCard from './CategoryCard';
import Pagination from './Pagination';

const CATEGORIES_PER_PAGE = 24; // 8 columns × 3 rows
const GRID_COLUMNS = {
  mobile: 2,
  tablet: 4,
  desktop: 8
};

const CategoryGrid = ({ 
  categories, 
  links, 
  onCategorySelect, 
  searchTerm,
  currentPage = 1,
  onPageChange = null // New prop for external page control
}) => {
  // Only use internal state if external control is not provided
  const [internalPage, setInternalPage] = useState(1);
  const gridRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [gridColumns, setGridColumns] = useState(GRID_COLUMNS.desktop);
  
  // Determine if we're using internal or external pagination
  const activePage = onPageChange ? currentPage : internalPage;
  const setActivePage = onPageChange || setInternalPage;
  
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

  // Calculate number of links per category
  const getCategoryLinkCount = (categoryName) => {
    return links.filter(link => link.category === categoryName).length;
  };

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    let categoriesList = [...categories];
    
    // Only add Uncategorized if there are uncategorized links
    const uncategorizedCount = links.filter(link => !link.category || link.category === "Uncategorized").length;
    if (uncategorizedCount > 0) {
      categoriesList.push({
        id: "uncategorized",
        name: "Uncategorized",
        icon: "folder" // Default icon
      });
    }

    // Apply search filter if search term exists
    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      categoriesList = categoriesList.filter(category => 
        category.name.toLowerCase().includes(lowerSearch)
      );
    }
    
    return categoriesList;
  }, [categories, links, searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setActivePage(1);
    setFocusedIndex(-1);
  }, [searchTerm, setActivePage]);

  // Paginate categories
  const paginatedCategories = useMemo(() => {
    const startIndex = (activePage - 1) * CATEGORIES_PER_PAGE;
    return filteredCategories.slice(startIndex, startIndex + CATEGORIES_PER_PAGE);
  }, [filteredCategories, activePage]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE));

  // Handle arrow key navigation
  const handleKeyDown = (e) => {
    if (paginatedCategories.length === 0) return;
    
    // Only handle arrow keys and tab
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
        newIndex = Math.min(paginatedCategories.length - 1, focusedIndex + gridColumns);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(paginatedCategories.length - 1, focusedIndex + 1);
        break;
      case 'Tab':
        // Let Tab handle focus naturally
        return;
    }
    
    // Update focused index if changed
    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      
      // Focus the new element
      const cards = gridRef.current?.querySelectorAll('[role="button"]');
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
  }, [focusedIndex, paginatedCategories.length, gridColumns]);

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div 
        ref={gridRef} 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
        tabIndex="-1" // Make it focusable but not in tab order
      >
        {paginatedCategories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            linkCount={category.name === "Uncategorized" ? 
              links.filter(link => !link.category || link.category === "Uncategorized").length : 
              getCategoryLinkCount(category.name)}
            onCategorySelect={onCategorySelect}
            tabIndex={index === 0 ? 0 : -1} // Only first card is in tab order
          />
        ))}
        {paginatedCategories.length === 0 && (
          <div className="col-span-full text-center text-green-600 py-8">
            {filteredCategories.length === 0 
              ? "No categories found" 
              : "No matching categories found"}
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={setActivePage}
            tabIndex="-1" // Remove pagination from tab order
          />
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;