// app/lib/components/categories-management/components/EditFolderModal.js
import { useState } from 'react';
import { X } from 'lucide-react';
import { availableIcons, renderIcon } from '../icons';

const EditFolderModal = ({ isOpen, onClose, category, onSave }) => {
  const [editedCategory, setEditedCategory] = useState(category);

  const handleSave = () => {
    onSave(editedCategory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-green-400">Edit Category</h3>
          <button onClick={onClose} className="text-green-500 hover:text-green-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={editedCategory.name}
            onChange={(e) => setEditedCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Category Name"
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
          />

          <div>
            <label className="block text-sm text-green-400 mb-2">Select Icon</label>
            <div className="grid grid-cols-4 gap-2 p-2 bg-black border border-green-800 rounded-lg">
              {Object.entries(availableIcons).map(([name]) => (
                <button
                  key={name}
                  onClick={() => setEditedCategory(prev => ({ ...prev, icon: name }))}
                  className={`p-2 rounded-lg hover:bg-green-900/30 ${
                    editedCategory.icon === name ? 'bg-green-900/50 border border-green-400' : ''
                  }`}
                >
                  <div className="text-green-500 w-5 h-5">
                    {renderIcon(name)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-green-900 text-green-100 rounded-lg hover:bg-green-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;