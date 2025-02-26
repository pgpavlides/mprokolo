// app/lib/page.js - Complete version with direct category updates
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MatrixRain from '@/components/MatrixRain';
import TopBar from './components/TopBar';
import LinkGrid from './components/LinkGrid';
import CategoryGrid from './components/CategoryGrid';
import Pagination from './components/Pagination';
import ViewToggle from './components/ViewToggle';
import AddLinkModal from './components/AddLinkModal';
import CategoriesManagement from './components/categories-management';
import EditLinkModal from './components/categories-management/components/EditLinkModal';
import BookmarksSyncModal from './components/BookmarksSyncModal';
import SkipToContent from './components/SkipToContent';

const LinksPerPage = 18; // 6x3 grid

export default function LibraryPage() {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('links'); // 'links' or 'categories'
  const [selectedLinks, setSelectedLinks] = useState(new Set());
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isBookmarksSyncModalOpen, setIsBookmarksSyncModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const gridContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [categoryPage, setCategoryPage] = useState(1); // Separate state for category pagination

  // Get the active page based on current view
  const activePage = viewMode === 'links' ? currentPage : categoryPage;
  const setActivePage = viewMode === 'links' ? setCurrentPage : setCategoryPage;

  // Load data from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem("mprokolo-library-links");
    const savedCategories = localStorage.getItem("mprokolo-library-categories");
    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    
    // Load viewMode preference if exists
    const savedViewMode = localStorage.getItem("mprokolo-library-view-mode");
    if (savedViewMode) setViewMode(savedViewMode);
  }, []);

  // Direct category update handler from bookmark import
  const handleCategoriesImport = (newCategories) => {
    if (!newCategories || !Array.isArray(newCategories) || newCategories.length === 0) {
      return;
    }

    console.log('Updating categories directly:', newCategories);
    
    // Process to ensure categories have the required format and unique IDs
    const processedCategories = newCategories.map(cat => ({
      id: cat.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: cat.name,
      icon: cat.icon || 'folder'
    }));
    
    // Merge with existing categories, avoiding duplicates by name
    setCategories(prevCategories => {
      // Filter out new categories that already exist (by name)
      const filteredNewCategories = processedCategories.filter(newCat => 
        !prevCategories.some(existingCat => existingCat.name === newCat.name)
      );
      
      // Combine existing and new categories
      return [...prevCategories, ...filteredNewCategories];
    });
    
    // Save to localStorage immediately to ensure persistence
    setTimeout(() => {
      const updatedCategories = JSON.parse(localStorage.getItem("mprokolo-library-categories") || '[]');
      console.log('Categories saved to localStorage:', updatedCategories);
    }, 100);
  };

  // Custom tab handling to jump directly from search to grid
  useEffect(() => {
    const handleSearchKeyDown = (e) => {
      if (e.key === 'Tab' && !e.shiftKey && e.target === searchInputRef.current) {
        e.preventDefault(); // Prevent default tab behavior
        
        // Focus the grid container first to ensure proper keyboard navigation context
        if (gridContainerRef.current) {
          gridContainerRef.current.focus();
          
          // Then find the first focusable card and focus it
          const firstCard = gridContainerRef.current.querySelector('[role="button"], [role="link"]');
          if (firstCard) {
            firstCard.focus();
          }
        }
      }
    };
    
    // Add event listener to search input
    if (searchInputRef.current) {
      searchInputRef.current.addEventListener('keydown', handleSearchKeyDown);
    }
    
    // Clean up
    return () => {
      if (searchInputRef.current) {
        searchInputRef.current.removeEventListener('keydown', handleSearchKeyDown);
      }
    };
  }, []);

  // Toggle view mode keyboard shortcut (Ctrl+Y)
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'links' ? 'categories' : 'links';
    setViewMode(newMode);
    resetPage();
  }, [viewMode]);

  // Filter links based on search term and selected category
  const filteredLinks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return links.filter(link =>
      (searchTerm === "" ||
        link.name?.toLowerCase().includes(lowerSearch) ||
        link.description?.toLowerCase().includes(lowerSearch) ||
        link.link?.toLowerCase().includes(lowerSearch) ||
        (Array.isArray(link.tags) &&
          link.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
      ) &&
      (selectedCategory === "" || link.category === selectedCategory)
    );
  }, [links, searchTerm, selectedCategory]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    const lowerSearch = searchTerm.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(lowerSearch)
    );
  }, [categories, searchTerm]);

  // Calculate total pages for both views
  const totalLinkPages = Math.max(1, Math.ceil(filteredLinks.length / LinksPerPage));
  const totalCategoryPages = Math.max(1, Math.ceil(filteredCategories.length / 24)); // 8x3 grid = 24 items

  // Get the current total pages based on view mode
  const totalPages = viewMode === 'links' ? totalLinkPages : totalCategoryPages;

  // Set up keyboard shortcuts - now using activePage and setActivePage
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process shortcuts if no modal is open
      if (isAddLinkModalOpen || isCategoriesModalOpen || isBookmarksSyncModalOpen || editingLink) {
        return;
      }

      // Ctrl+Y to toggle view mode
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        toggleViewMode();
      }
      
      // Ctrl+F to focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Ctrl+ArrowLeft to go to previous page
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activePage > 1) {
          // Direct state update for reliable navigation
          setActivePage(prev => Math.max(1, prev - 1));
          console.log(`Navigating to previous page: ${activePage - 1} in ${viewMode} view`);
        }
      }

      // Ctrl+ArrowRight to go to next page
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (activePage < totalPages) {
          // Direct state update for reliable navigation
          setActivePage(prev => Math.min(totalPages, prev + 1));
          console.log(`Navigating to next page: ${activePage + 1} in ${viewMode} view`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleViewMode, 
    activePage, 
    totalPages, 
    setActivePage,
    viewMode,
    isAddLinkModalOpen, 
    isCategoriesModalOpen, 
    isBookmarksSyncModalOpen, 
    editingLink
  ]);

  // Debugging total pages
  useEffect(() => {
    console.log(`${viewMode} view - Total pages: ${totalPages}, Current page: ${activePage}`);
  }, [totalPages, activePage, viewMode]);

  // Save viewMode preference
  useEffect(() => {
    localStorage.setItem("mprokolo-library-view-mode", viewMode);
  }, [viewMode]);

  // Save data to localStorage when links or categories change
  useEffect(() => {
    localStorage.setItem("mprokolo-library-links", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem("mprokolo-library-categories", JSON.stringify(categories));
  }, [categories]);

  // Reset selected links when exiting edit mode
  useEffect(() => {
    if (!editMode) {
      setSelectedLinks(new Set());
    }
  }, [editMode]);

  // Reset to page 1 when switching view modes
  useEffect(() => {
    resetPage();
  }, [viewMode]);

  // New function to reset page to 1
  const resetPage = () => {
    if (viewMode === 'links') {
      setCurrentPage(1);
    } else {
      setCategoryPage(1);
    }
  };

  // Handle category selection from CategoryGrid
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setViewMode('links'); // Switch to links view when category is selected
    resetPage(); // Reset to page 1
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    if (mode !== viewMode) {
      setViewMode(mode);
      // Reset page when switching views
      resetPage();
    }
  };

  // Paginate filtered links
  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * LinksPerPage;
    return filteredLinks.slice(startIndex, startIndex + LinksPerPage);
  }, [filteredLinks, currentPage]);

  // Ensure current page is valid when total pages changes
  useEffect(() => {
    if (currentPage > totalLinkPages) {
      setCurrentPage(Math.max(1, totalLinkPages));
    }
    if (categoryPage > totalCategoryPages) {
      setCategoryPage(Math.max(1, totalCategoryPages));
    }
  }, [totalLinkPages, totalCategoryPages, currentPage, categoryPage]);

  // Handle adding a new link
  const handleAddLink = (newLink) => {
    const linkToAdd = {
      ...newLink,
      id: `link_${newLink.name}_${newLink.link}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (!linkToAdd.thumbnail) {
      try {
        const url = new URL(linkToAdd.link);
        linkToAdd.thumbnail = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
      } catch {
        linkToAdd.thumbnail = "/globe.svg"; // Use updated fallback
      }
    }

    setLinks(prev => [...prev, linkToAdd]);
    setIsAddLinkModalOpen(false);
  };

  // Handle importing bookmarks
  const handleImportBookmarks = (bookmarks) => {
    // Add new bookmarks to existing links
    setLinks(prevLinks => {
      // Ensure each bookmark has a unique ID
      const processedBookmarks = bookmarks.map(bookmark => ({
        ...bookmark,
        id: `bookmark_${bookmark.name}_${bookmark.link}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // Filter out duplicate bookmarks based on URL
      const newBookmarks = processedBookmarks.filter(newBookmark => 
        !prevLinks.some(existingLink => existingLink.link === newBookmark.link)
      );

      return [...prevLinks, ...newBookmarks];
    });
    
    // Create a notification
    if (bookmarks.length > 0) {
      const message = `Successfully imported ${bookmarks.length} bookmarks!`;
      alert(message);
    }
    
    // Reset to page 1 after import
    resetPage();
  };

  // Handle category updates
  const handleCategoriesUpdate = (updatedCategories) => {
    setCategories(updatedCategories);
    setIsCategoriesModalOpen(false);
  };

  // Toggle selection for a given link (used in edit mode)
  const toggleLinkSelection = (linkId) => {
    if (!editMode) return;
    setSelectedLinks(prev => {
      const next = new Set(prev);
      next.has(linkId) ? next.delete(linkId) : next.add(linkId);
      return next;
    });
  };

  // Delete selected links
  const handleDeleteSelected = () => {
    if (selectedLinks.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedLinks.size} selected link(s)?`)) {
      const updatedLinks = links.filter(link => !selectedLinks.has(link.id));
      setLinks(updatedLinks);
      setSelectedLinks(new Set());
    }
  };

  // Select or deselect all visible links
  const selectAllLinks = () => {
    if (selectedLinks.size === paginatedLinks.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(paginatedLinks.map(link => link.id)));
    }
  };

  // Edit link
  const handleEditLink = (link) => {
    setEditingLink(link);
  };

  // Save updated link
  const handleSaveLink = (updatedLink) => {
    const updatedLinks = links.map(link =>
      link.id === updatedLink.id ? updatedLink : link
    );
    setLinks(updatedLinks);
    setEditingLink(null);
  };

  const handleSyncBookmarks = () => {
    setIsBookmarksSyncModalOpen(true);
  };

  return (
    <>
      <MatrixRain />
      <SkipToContent />
      <div className="min-h-screen bg-transparent p-6">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/" className="text-green-400 hover:text-green-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-xs text-green-600">
              Shortcuts: Ctrl+Y (toggle view), Ctrl+F (search), Ctrl+← / Ctrl+→ (change page)
            </div>
            <ViewToggle viewMode={viewMode} setViewMode={handleViewModeChange} tabIndex="-1" />
            <button
              onClick={() => setIsCategoriesModalOpen(true)}
              className="px-4 py-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
              tabIndex="-1"
            >
              Manage Categories
            </button>
          </div>
        </div>

        <TopBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onAddClick={() => setIsAddLinkModalOpen(true)}
          onSettingsClick={() => setIsCategoriesModalOpen(true)}
          editMode={editMode}
          onEditModeToggle={() => setEditMode(!editMode)}
          selectedLinks={selectedLinks}
          onSelectAll={selectAllLinks}
          onDeleteSelected={handleDeleteSelected}
          onSyncBookmarks={handleSyncBookmarks}
          resetPage={resetPage}
          viewMode={viewMode}
          searchInputRef={searchInputRef}
        />

        <div 
          id="grid-container" 
          ref={gridContainerRef} 
          tabIndex="-1" 
          className="outline-none"
          aria-label={viewMode === 'links' ? 'Links grid' : 'Categories grid'}
        >
          {viewMode === 'links' ? (
            <>
              <LinkGrid
                links={paginatedLinks}
                editMode={editMode}
                selectedLinks={selectedLinks}
                onLinkSelect={toggleLinkSelection}
                onEditLink={handleEditLink}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalLinkPages}
                onPageChange={setCurrentPage}
                tabIndex="-1" // Remove pagination from tab order
              />
            </>
          ) : (
            <CategoryGrid 
              categories={categories}
              links={links}
              onCategorySelect={handleCategorySelect}
              searchTerm={searchTerm}
              currentPage={categoryPage}
              onPageChange={setCategoryPage}
            />
          )}
        </div>

        {isAddLinkModalOpen && (
          <AddLinkModal
            isOpen={isAddLinkModalOpen}
            onClose={() => setIsAddLinkModalOpen(false)}
            onAddLink={handleAddLink}
            categories={categories}
          />
        )}

        {isCategoriesModalOpen && (
          <CategoriesManagement
            isOpen={isCategoriesModalOpen}
            onClose={() => setIsCategoriesModalOpen(false)}
            existingCategories={categories}
            onCategoriesUpdate={handleCategoriesUpdate}
          />
        )}

        {editingLink && (
          <EditLinkModal
            isOpen={true}
            onClose={() => setEditingLink(null)}
            link={editingLink}
            onSave={handleSaveLink}
            categories={categories}
          />
        )}

        <BookmarksSyncModal
          isOpen={isBookmarksSyncModalOpen}
          onClose={() => setIsBookmarksSyncModalOpen(false)}
          onImport={handleImportBookmarks}
          onCategoriesUpdate={handleCategoriesImport} // Pass the direct category update handler
        />
      </div>
    </>
  );
}