import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

const CategoriesManagement = ({ 
  isOpen, 
  onClose, 
  existingCategories = [], 
  onCategoriesUpdate 
}) => {
  const [categories, setCategories] = useState(existingCategories);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setNewCategory('');
      onCategoriesUpdate(updatedCategories);
    }
  };

  const removeCategory = (categoryToRemove) => {
    const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
    setCategories(updatedCategories);
    onCategoriesUpdate(updatedCategories);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCategory();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">
            Manage Categories
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter new category"
            className="flex-1 bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
          />
          <button
            onClick={addCategory}
            className="p-2 border border-green-800 rounded hover:border-green-600"
          >
            <Plus className="w-5 h-5 text-green-500" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded"
            >
              <span>{category}</span>
              <button
                onClick={() => removeCategory(category)}
              >
                <Trash2 className="w-4 h-4 text-green-500 hover:text-green-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement;