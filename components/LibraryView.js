import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Edit2, Trash2, X, CheckSquare, Square } from 'lucide-react';
import TopBar from './components/TopBar';
import Link from 'next/link';

const LibraryView = () => {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState(new Set());

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

  // Save links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mprokolo-library-links', JSON.stringify(links));
  }, [links]);

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

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedLinks(new Set());
  };

  const toggleLinkSelection = (linkId) => {
    setSelectedLinks(prev => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.add(linkId);
      }
      return next;
    });
  };

  const selectAllLinks = () => {
    if (selectedLinks.size === filteredLinks.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(filteredLinks.map(link => link.id)));
    }
  };

  const deleteSelectedLinks = () => {
    if (selectedLinks.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedLinks.size} link(s)?`)) {
      const updatedLinks = links.filter(link => !selectedLinks.has(link.id));
      setLinks(updatedLinks);
      setSelectedLinks(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
          <h1 className="text-2xl font-bold">Link Library</h1>

        </div>

        {/* TopBar */}
        <TopBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={categoryFilter}
          setSelectedCategory={setCategoryFilter}
          categories={categories}
          onAddClick={() => {}}
          onSettingsClick={() => {}}
          editMode={editMode}
          onEditModeToggle={toggleEditMode}
        />

        {/* Additional Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-800 rounded-lg 
                       text-green-400 placeholder-green-700"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-green-800 rounded-lg p-2 text-green-400"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-black border border-green-800 rounded-lg p-2 text-green-400"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters and Actions Bar */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-green-600">
              {filteredLinks.length} results
            </span>
            {(searchTerm || categoryFilter || tagFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-green-400 hover:text-green-300"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          
          {editMode && (
            <div className="flex items-center gap-4">
              <button
                onClick={selectAllLinks}
                className="flex items-center gap-2 text-green-400 hover:text-green-300"
              >
                {selectedLinks.size === filteredLinks.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>{selectedLinks.size === filteredLinks.length ? 'Deselect All' : 'Select All'}</span>
              </button>
              {selectedLinks.size > 0 && (
                <button
                  onClick={deleteSelectedLinks}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedLinks.size})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map(link => (
            <div
              key={link.id}
              className={`bg-green-900/20 border rounded-lg p-4 transition-colors
                ${editMode 
                  ? selectedLinks.has(link.id)
                    ? 'border-green-400 bg-green-900/30'
                    : 'border-green-800 hover:border-green-600'
                  : 'border-green-800 hover:bg-green-900/30'}`}
              onClick={() => editMode ? toggleLinkSelection(link.id) : null}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      {selectedLinks.has(link.id) ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      ) : (
                        <Square className="w-4 h-4 text-green-400" />
                      )}
                      <span className="font-medium text-green-400 truncate">
                        {link.name}
                      </span>
                    </div>
                  ) : (
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-400 hover:text-green-300 truncate block"
                    >
                      {link.name}
                    </a>
                  )}
                  
                  {link.category && (
                    <span className="inline-block mt-1 text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                      {link.category}
                    </span>
                  )}
                  
                  {link.description && (
                    <p className="mt-2 text-sm text-green-600 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                  
                  {link.tags && link.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
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

        {filteredLinks.length === 0 && (
          <div className="text-center text-green-600 py-10">
            No links found
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;