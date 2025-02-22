import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, X } from 'lucide-react';

const LibraryView = ({ onBack, hideBackToMenu = false }) => {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('mprokolo-library-links');
    const savedCategories = localStorage.getItem('mprokolo-library-categories');
    
    if (savedLinks) {
      const parsedLinks = JSON.parse(savedLinks);
      setLinks(parsedLinks);

      // Extract unique categories and tags
      const uniqueCategories = [...new Set(parsedLinks.map(link => link.category).filter(Boolean))];
      const uniqueTags = [...new Set(parsedLinks.flatMap(link => link.tags || []))];
      
      setCategories(uniqueCategories);
      setAllTags(uniqueTags);
    }
  }, []);

  // Filter links based on search and filters
  const filteredLinks = links.filter(link => {
    const matchesSearch = !searchTerm || 
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.link.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || link.category === categoryFilter;
    
    const matchesTags = !tagFilter || 
      (link.tags && link.tags.includes(tagFilter));

    return matchesSearch && matchesCategory && matchesTags;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTagFilter('');
  };

  return (
    <div className="bg-black text-green-400 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          {!hideBackToMenu && (
            <button 
              onClick={onBack} 
              className="text-green-400 hover:text-green-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-2xl font-bold text-center flex-1">Link Library</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-800 rounded-lg 
                         text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-green-800 rounded p-2 text-green-400"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-black border border-green-800 rounded p-2 text-green-400"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || categoryFilter || tagFilter) && (
          <div className="mb-4 flex justify-between items-center">
            <span className="text-green-600">
              {filteredLinks.length} results
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-green-400 hover:text-green-300"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}

        {/* Links List */}
        {filteredLinks.length === 0 ? (
          <div className="text-center text-green-600 py-10">
            No links found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map(link => (
              <div 
                key={link.id} 
                className="bg-green-900/20 border border-green-800 rounded-lg p-4 hover:bg-green-900/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <a 
                        href={link.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-green-400 hover:text-green-300 truncate"
                      >
                        {link.name}
                      </a>
                      {link.category && (
                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                          {link.category}
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-sm text-green-600 mb-2">
                        {link.description}
                      </p>
                    )}
                    {link.tags && link.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {link.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="text-xs bg-green-900/30 text-green-400 px-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;