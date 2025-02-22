import SearchBar from './SearchBar';
import CategorySelect from './CategorySelect';
import ActionButtons from './ActionButtons';

const TopBar = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  categories,
  onAddClick,
  onSettingsClick 
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
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
        
        <ActionButtons 
          onAddClick={onAddClick}
          onSettingsClick={onSettingsClick}
        />
      </div>
    </div>
  );
};

export default TopBar;