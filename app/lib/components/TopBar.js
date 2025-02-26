// app/lib/components/TopBar.js - Updated with tabIndex control
import SearchBar from './SearchBar';
import CategorySelect from './CategorySelect';
import { Plus, Settings, Edit2, Trash2, CheckSquare, BookmarkIcon } from 'lucide-react';

const TopBar = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  categories,
  onAddClick,
  onSettingsClick,
  editMode,
  onEditModeToggle,
  selectedLinks,
  onSelectAll,
  onDeleteSelected,
  onSyncBookmarks,
  resetPage,
  viewMode,
  searchInputRef
}) => {
  // Determine placeholder text based on current view mode
  const searchPlaceholder = viewMode === 'categories' 
    ? "Search categories..." 
    : "Search links...";

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm border border-green-800 rounded-lg p-4">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          resetPage={resetPage}
          placeholder={searchPlaceholder}
          inputRef={searchInputRef}
        />
        
        {/* Only show category selector in links view */}
        {viewMode === 'links' && (
          <CategorySelect 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            resetPage={resetPage}
            tabIndex="-1" // Remove from tab order
          />
        )}
        
        <div className="flex gap-2">
          {/* Set tabIndex=-1 on all buttons to remove them from tab order */}
          <button
            onClick={onAddClick}
            className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
            title="Add new link"
            tabIndex="-1"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
            title="Manage categories"
            tabIndex="-1"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onSyncBookmarks}
            className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors flex items-center gap-2"
            title="Sync Chrome Bookmarks"
            tabIndex="-1"
          >
            <BookmarkIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Sync Bookmarks</span>
          </button>
          
          {/* Only show edit mode toggle in links view */}
          {viewMode === 'links' && (
            <button
              onClick={onEditModeToggle}
              className={`p-2 border text-green-400 rounded-lg transition-colors ${
                editMode 
                  ? 'bg-green-900 border-green-400' 
                  : 'bg-green-900/30 border-green-800 hover:border-green-400'
              }`}
              title={editMode ? "Exit edit mode" : "Enter edit mode"}
              tabIndex="-1"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}

          {editMode && viewMode === 'links' && (
            <>
              <button
                onClick={onSelectAll}
                className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
                title="Select all visible links"
                tabIndex="-1"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
              {selectedLinks.size > 0 && (
                <button
                  onClick={onDeleteSelected}
                  className="p-2 bg-red-900/30 border border-red-800 text-red-400 rounded-lg hover:border-red-400 transition-colors flex items-center gap-2"
                  title="Delete selected links"
                  tabIndex="-1"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm">({selectedLinks.size})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;