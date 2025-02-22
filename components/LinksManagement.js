import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import CategoriesManagement from './CategoriesManagement';

const LinksManagement = ({ onBack, hideBackToMenu = false }) => {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [newLink, setNewLink] = useState({
    name: '',
    category: '',
    description: '',
    tags: '',
    link: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('mprokolo-library-links');
    const savedCategories = localStorage.getItem('mprokolo-library-categories');
    
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mprokolo-library-links', JSON.stringify(links));
  }, [links]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mprokolo-library-categories', JSON.stringify(categories));
  }, [categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLink(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addOrUpdateLink = () => {
    // Validate input
    if (!newLink.name || !newLink.link) {
      alert('Name and Link are required');
      return;
    }

    // Prepare tags (split by comma and trim)
    const processedTags = newLink.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    const linkToSave = {
      ...newLink,
      id: editingLink ? editingLink.id : Date.now(),
      tags: processedTags
    };

    if (editingLink) {
      // Update existing link
      setLinks(prev => 
        prev.map(link => link.id === editingLink.id ? linkToSave : link)
      );
    } else {
      // Add new link
      setLinks(prev => [...prev, linkToSave]);
    }

    // Reset form
    setNewLink({
      name: '',
      category: '',
      description: '',
      tags: '',
      link: ''
    });
    setEditingLink(null);
  };

  const editLink = (link) => {
    setEditingLink(link);
    setNewLink({
      ...link,
      tags: link.tags ? link.tags.join(', ') : ''
    });
  };

  const deleteLink = (id) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleCategoriesUpdate = (updatedCategories) => {
    setCategories(updatedCategories);
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
          <h1 className="text-2xl font-bold text-center flex-1">Add Link</h1>
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="px-4 py-2 bg-green-900/30 border border-green-800 rounded 
                       hover:border-green-400 transition-colors"
          >
            Manage Categories
          </button>
        </div>

        {/* Link Input Form */}
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={newLink.name}
              onChange={handleInputChange}
              placeholder="Link Name *"
              className="bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
              required
            />
            <select
              name="category"
              value={newLink.category}
              onChange={handleInputChange}
              className="bg-black border border-green-800 rounded p-2 text-green-400"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              name="link"
              value={newLink.link}
              onChange={handleInputChange}
              placeholder="URL *"
              className="bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
              required
            />
            <input
              type="text"
              name="tags"
              value={newLink.tags}
              onChange={handleInputChange}
              placeholder="Tags (comma separated)"
              className="bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
            />
            <div className="col-span-2">
              <textarea
                name="description"
                value={newLink.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
                rows="3"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button
              onClick={addOrUpdateLink}
              className="px-4 py-2 bg-green-900 text-green-100 rounded 
                         hover:bg-green-800 transition-colors"
            >
              {editingLink ? 'Update Link' : 'Add Link'}
            </button>
            {editingLink && (
              <button
                onClick={() => {
                  setEditingLink(null);
                  setNewLink({
                    name: '',
                    category: '',
                    description: '',
                    tags: '',
                    link: ''
                  });
                }}
                className="px-4 py-2 bg-red-900/30 text-red-400 rounded 
                           hover:bg-red-900/50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing Links List */}
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Existing Links</h2>
          {links.length === 0 ? (
            <p className="text-green-600 text-center">No links saved yet</p>
          ) : (
            <div className="space-y-2">
              {links.map(link => (
                <div 
                  key={link.id} 
                  className="flex justify-between items-center bg-green-900/30 
                             border border-green-800 rounded p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
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
                      <p className="text-sm text-green-600 mt-1 truncate">
                        {link.description}
                      </p>
                    )}
                    {link.tags && link.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
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
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => editLink(link)}
                      className="text-green-500 hover:text-green-400"
                      title="Edit Link"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-red-500 hover:text-red-400"
                      title="Delete Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Management Modal */}
        {isCategoriesModalOpen && (
          <CategoriesManagement
            isOpen={isCategoriesModalOpen}
            onClose={() => setIsCategoriesModalOpen(false)}
            existingCategories={categories}
            onCategoriesUpdate={handleCategoriesUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default LinksManagement;