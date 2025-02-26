// app/lib/components/SearchBar.js
import { Search } from 'lucide-react';
import { useEffect } from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, resetPage, placeholder = "Search links...", inputRef }) => {
  // This function handles both updating the search term and resetting the page
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to page 1 whenever search term changes
    resetPage();
  };

  // Add custom tab handling to directly jump to grid
  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // Let the parent component handle this with event listener
      // This ensures the focus order is preserved
      // Don't prevent default here as we want the parent handler to work
    }
  };

  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-4 py-2 bg-black/50 border border-green-800 rounded-lg text-green-400 placeholder-green-700"
        ref={inputRef}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
    </div>
  );
};

export default SearchBar;