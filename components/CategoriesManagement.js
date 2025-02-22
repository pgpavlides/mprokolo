import { useState } from 'react';
import { X, Plus, Trash2, Search, CheckSquare, Square, Info } from 'lucide-react';
import * as FaIcons from 'react-icons/fa';

// Available icons map with their components
const availableIcons = {
  folder: FaIcons.FaFolder,
  code: FaIcons.FaCode,
  book: FaIcons.FaBook,
  tools: FaIcons.FaTools,
  link: FaIcons.FaLink,
  globe: FaIcons.FaGlobe,
  database: FaIcons.FaDatabase,
  cloud: FaIcons.FaCloud,
  cog: FaIcons.FaCog,
  brain: FaIcons.FaBrain,
  robot: FaIcons.FaRobot,
  palette: FaIcons.FaPalette,
  pen: FaIcons.FaPen,
  chart: FaIcons.FaChartBar,
  gamepad: FaIcons.FaGamepad,
  shield: FaIcons.FaShieldAlt
};

const CategoriesManagement = ({ isOpen, onClose, existingCategories = [], onCategoriesUpdate }) => {
  const [categories, setCategories] = useState(Array.isArray(existingCategories) ? existingCategories : []);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'folder' });
  const [showIconSelector, setShowIconSelector] = useState(false);

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter(cat =>
    cat && cat.name && cat.name.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSelectCategory = (categoryName) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(filteredCategories.map(cat => cat.name)));
    }
  };

  const addCategory = () => {
    const trimmedName = newCategory.name.trim();
    if (trimmedName && !categories.some(cat => cat && cat.name === trimmedName)) {
      const updatedCategories = [...categories, {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        icon: newCategory.icon
      }];
      setCategories(updatedCategories);
      onCategoriesUpdate(updatedCategories);
      setNewCategory({ name: '', icon: 'folder' });
      setShowIconSelector(false);
    }
  };

  const deleteSelectedCategories = () => {
    const updatedCategories = categories.filter(cat => !selectedCategories.has(cat.name));
    setCategories(updatedCategories);
    onCategoriesUpdate(updatedCategories);
    setSelectedCategories(new Set());
  };

  const renderIcon = (iconName) => {
    const IconComponent = availableIcons[iconName] || availableIcons.folder;
    return <IconComponent />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-800">
          <div>
            <h2 className="text-xl font-semibold text-green-400">Category Management</h2>
            <p className="text-green-600 mt-1">Organize your links with categories and icons</p>
          </div>
          <button onClick={onClose} className="text-green-500 hover:text-green-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Add New Category */}
          <div className="space-y-6">
            <div className="bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-400 mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Category
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Category name"
                    className="w-full bg-black border border-green-800 rounded-lg p-2 pl-10 text-green-400 placeholder-green-700"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4">
                    {renderIcon(newCategory.icon)}
                  </div>
                </div>

                <div>
                  <label className="text-green-400 text-sm mb-2 block">Select an icon</label>
                  <div className="grid grid-cols-8 gap-2 p-2 bg-black border border-green-800 rounded-lg">
                    {Object.entries(availableIcons).map(([name]) => (
                      <button
                        key={name}
                        onClick={() => setNewCategory(prev => ({ ...prev, icon: name }))}
                        className={`p-2 rounded-lg hover:bg-green-900/30 ${
                          newCategory.icon === name ? 'bg-green-900/50 border border-green-400' : ''
                        }`}
                        title={name}
                      >
                        <div className="text-green-500 w-5 h-5">
                          {renderIcon(name)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addCategory}
                  disabled={!newCategory.name.trim()}
                  className="w-full mt-4 px-4 py-2 bg-green-900 text-green-100 rounded-lg 
                           hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-400 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Tips
              </h3>
              <ul className="text-blue-300 text-sm space-y-2">
                <li>• Choose meaningful icons to make categories easily recognizable</li>
                <li>• Use clear, descriptive names for your categories</li>
                <li>• You can select multiple categories to delete them at once</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Manage Existing Categories */}
          <div className="bg-green-900/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-400 mb-4 flex items-center gap-2">
              <FaIcons.FaListUl className="w-5 h-5" />
              Manage Categories
            </h3>

            {/* Search and Bulk Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-green-800 rounded-lg p-2 pl-10 text-green-400 placeholder-green-700"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                </div>
                <button
                  onClick={handleSelectAll}
                  className="p-2 border border-green-800 rounded-lg hover:border-green-600"
                  title={selectedCategories.size === filteredCategories.length ? "Deselect all" : "Select all"}
                >
                  {selectedCategories.size === filteredCategories.length ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5 text-green-500" />
                  )}
                </button>
                {selectedCategories.size > 0 && (
                  <button
                    onClick={deleteSelectedCategories}
                    className="p-2 border border-red-800 rounded-lg hover:border-red-600"
                    title="Delete selected"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                )}
              </div>

              {/* Categories List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedCategories.has(category.name)
                        ? 'bg-green-900/30 border-green-400'
                        : 'border-green-800 hover:border-green-600'
                    }`}
                    onClick={() => handleSelectCategory(category.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-green-500 w-5 h-5">
                        {renderIcon(category.icon)}
                      </div>
                      <span className="text-green-400">{category.name}</span>
                    </div>
                    {selectedCategories.has(category.name) ? (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    ) : (
                      <Square className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-center text-green-600 py-8">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement;