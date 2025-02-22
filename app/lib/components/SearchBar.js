import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder="Search links..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-black/50 border border-green-800 rounded-lg text-green-400 placeholder-green-700"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
    </div>
  );
};

export default SearchBar;