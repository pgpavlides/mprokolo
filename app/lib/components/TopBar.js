import SearchBar from './SearchBar';
import CategorySelect from './CategorySelect';
import { Plus, Settings, Edit2, Trash2, CheckSquare } from 'lucide-react';

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
  onDeleteSelected
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm border border-green-800 rounded-lg p-4">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        <CategorySelect 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        
        <div className="flex gap-2">
          <button
            onClick={onAddClick}
            className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
            title="Add new link"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
            title="Manage categories"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onEditModeToggle}
            className={`p-2 border text-green-400 rounded-lg transition-colors ${
              editMode 
                ? 'bg-green-900 border-green-400' 
                : 'bg-green-900/30 border-green-800 hover:border-green-400'
            }`}
            title={editMode ? "Exit edit mode" : "Enter edit mode"}
          >
            <Edit2 className="w-5 h-5" />
          </button>

          {editMode && (
            <>
              <button
                onClick={onSelectAll}
                className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
                title="Select all visible links"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
              {selectedLinks.size > 0 && (
                <button
                  onClick={onDeleteSelected}
                  className="p-2 bg-red-900/30 border border-red-800 text-red-400 rounded-lg hover:border-red-400 transition-colors flex items-center gap-2"
                  title="Delete selected links"
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