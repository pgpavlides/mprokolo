// app/lib/components/categories-management/index.js
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Edit2 } from 'lucide-react';
import FileExplorerItem from './components/FileExplorerItem';
import EditLinkModal from './components/EditLinkModal';
import EditFolderModal from './components/EditFolderModal';
import DebugPanel from './components/DebugPanel';
import StatisticsPanel from './components/StatisticsPanel';
import TipsPanel from './components/TipsPanel';
import { renderIcon, availableIcons } from './icons';

const CategoriesManagement = ({ isOpen, onClose, existingCategories = [], onCategoriesUpdate }) => {
  const [categories, setCategories] = useState(() => {
    if (!Array.isArray(existingCategories)) return [];
    return existingCategories.filter(cat => cat && cat.name && typeof cat.name === 'string');
  });
  
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'folder' });
  const [links, setLinks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Load links
  useEffect(() => {
    const savedLinks = localStorage.getItem('mprokolo-library-links');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  // Filter function
  const filteredItems = () => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchingCategories = categories.filter(cat =>
      cat && cat.name && typeof cat.name === 'string' &&
      cat.name.toLowerCase().includes(searchLower)
    );

    const matchingLinks = links.filter(link =>
      link && link.name && typeof link.name === 'string' && (
        // Search in name
        link.name.toLowerCase().includes(searchLower) ||
        // Search in URL
        link.link.toLowerCase().includes(searchLower) ||
        // Search in description
        (link.description && link.description.toLowerCase().includes(searchLower)) ||
        // Search in tags
        (Array.isArray(link.tags) && link.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      )
    );

    return { categories: matchingCategories, links: matchingLinks };
  };

  const handleEdit = (item) => {
    if ('link' in item) {
      setEditingLink(item);
    } else {
      setEditingCategory(item);
    }
  };

  const handleSaveLink = (updatedLink) => {
    const newLinks = links.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    );
    setLinks(newLinks);
    localStorage.setItem('mprokolo-library-links', JSON.stringify(newLinks));
    setEditingLink(null);
  };

  const handleSaveCategory = (updatedCategory) => {
    const newCategories = categories.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    setCategories(newCategories);
    onCategoriesUpdate(newCategories);
    setEditingCategory(null);
  };

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleToggleExpand = (folderId) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const addCategory = () => {
    const trimmedName = newCategory.name?.trim();
    if (!trimmedName) return;

    const isDuplicate = categories.some(cat => 
      cat && cat.name && cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (!isDuplicate) {
      const newCategoryObj = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        icon: newCategory.icon || 'folder'
      };

      const updatedCategories = [...categories, newCategoryObj];
      setCategories(updatedCategories);
      onCategoriesUpdate(updatedCategories);
      setNewCategory({ name: '', icon: 'folder' });
    }
  };

  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} selected item(s)?`)) {
      const updatedCategories = categories.filter(cat => !selectedItems.has(cat.id));
      const updatedLinks = links.filter(link => !selectedItems.has(link.id));
      
      setCategories(updatedCategories);
      onCategoriesUpdate(updatedCategories);
      setLinks(updatedLinks);
      localStorage.setItem('mprokolo-library-links', JSON.stringify(updatedLinks));
      setSelectedItems(new Set());
    }
  };

  const handleAddRandomLinks = async (count) => {
    const categoriesList = categories.map(cat => cat.name);
    
    const newLinks = Array.from({ length: count }, (_, i) => ({
      id: `link-${Date.now()}-${i}`,
      name: `Random Link ${Date.now() + i}`,
      link: `https://example.com/link${Date.now() + i}`,
      category: categoriesList[Math.floor(Math.random() * categoriesList.length)],
      description: `This is a randomly generated link for testing purposes.`,
      tags: ['test', 'random', 'debug'],
      thumbnail: `https://picsum.photos/200/300?random=${i}`
    }));

    const updatedLinks = [...links, ...newLinks];
    setLinks(updatedLinks);
    localStorage.setItem('mprokolo-library-links', JSON.stringify(updatedLinks));
  };

  if (!isOpen) return null;

  const { categories: filteredCategories, links: filteredLinks } = filteredItems();

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-green-800">
        <div>
          <h2 className="text-xl font-semibold text-green-400">Library Management</h2>
          <p className="text-green-600 mt-1">Manage your categories and links</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
              editMode 
                ? 'bg-green-900 border-green-400 text-green-100' 
                : 'bg-green-900/30 border-green-800 text-green-400 hover:border-green-400'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>{editMode ? 'Done' : 'Edit'}</span>
          </button>
          {selectedItems.size > 0 && editMode && (
            <button
              onClick={deleteSelectedItems}
              className="px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg 
                       hover:border-red-400 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedItems.size})</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-4 gap-6 h-full">
          {/* Left Panel - File Explorer */}
          <div className="col-span-3 p-6 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <input
                  type="text"
                  placeholder="Search categories and links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-green-800 rounded-lg 
                           text-green-400 placeholder-green-700"
                />
              </div>
            </div>

            {/* File Explorer */}
            <div className="border border-green-800 rounded-lg overflow-hidden">
              {filteredCategories.map(category => (
                <div key={category.id}>
                  <FileExplorerItem
                    item={category}
                    isFolder={true}
                    selectedItems={selectedItems}
                    expandedFolders={expandedFolders}
                    onToggleSelect={handleToggleSelect}
                    onToggleExpand={handleToggleExpand}
                    editMode={editMode}
                    onEdit={handleEdit}
                    iconName={category.icon}
                  />
                  
                  {expandedFolders.has(category.id) && 
                    filteredLinks
                      .filter(link => link.category === category.name)
                      .map(link => (
                        <FileExplorerItem
                          key={link.id}
                          item={link}
                          depth={1}
                          selectedItems={selectedItems}
                          expandedFolders={expandedFolders}
                          onToggleSelect={handleToggleSelect}
                          onToggleExpand={handleToggleExpand}
                          isFolder={false}
                          editMode={editMode}
                          onEdit={handleEdit}
                        />
                      ))
                  }
                </div>
              ))}

              {/* Uncategorized Links */}
              <div>
                <FileExplorerItem
                  item={{ id: 'uncategorized', name: 'Uncategorized' }}
                  isFolder={true}
                  selectedItems={selectedItems}
                  expandedFolders={expandedFolders}
                  onToggleSelect={handleToggleSelect}
                  onToggleExpand={handleToggleExpand}
                  editMode={editMode}
                  onEdit={handleEdit}
                  iconName="folder"
                />
                
                {expandedFolders.has('uncategorized') &&
                  filteredLinks
                    .filter(link => !link.category)
                    .map(link => (
                      <FileExplorerItem
                        key={link.id}
                        item={link}
                        depth={1}
                        selectedItems={selectedItems}
                        expandedFolders={expandedFolders}
                        onToggleSelect={handleToggleSelect}
                        onToggleExpand={handleToggleExpand}
                        isFolder={false}
                        editMode={editMode}
                        onEdit={handleEdit}
                      />
                    ))
                }
              </div>
            </div>
          </div>

          {/* Right Panel - Tools */}
          <div className="border-l border-green-800 p-6 space-y-6 overflow-y-auto">
            {/* Add New Category */}
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-400 mb-4">Add Category</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
                />

                <div className="grid grid-cols-4 gap-2 p-2 bg-black border border-green-800 rounded-lg">
                  {Object.entries(availableIcons).map(([name]) => (
                    <button
                      key={name}
                      onClick={() => setNewCategory(prev => ({ ...prev, icon: name }))}
                      className={`p-2 rounded-lg hover:bg-green-900/30 ${
                        newCategory.icon === name ? 'bg-green-900/50 border border-green-400' : ''
                      }`}
                    >
                      <div className="text-green-500 w-5 h-5">
                        {renderIcon(name)}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={addCategory}
                  disabled={!newCategory.name?.trim()}
                  className="w-full px-4 py-2 bg-green-900 text-green-100 rounded-lg 
                           hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <StatisticsPanel 
              categories={categories}
              links={links}
              selectedItems={selectedItems}
            />

            <DebugPanel onAddRandomLinks={handleAddRandomLinks} />

            <TipsPanel />
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {editingLink && (
        <EditLinkModal
          isOpen={true}
          onClose={() => setEditingLink(null)}
          link={editingLink}
          onSave={handleSaveLink}
        />
      )}

      {editingCategory && (
        <EditFolderModal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
};

export default CategoriesManagement;