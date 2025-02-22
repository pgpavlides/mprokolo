// app/lib/components/categories-management/components/EditFolderModal.js
import { useState } from 'react';
import { X } from 'lucide-react';
import { renderIcon } from '../icons';
import IconPickerModal from './IconPickerModal';

const EditFolderModal = ({ isOpen, onClose, category, onSave }) => {
  const [editedCategory, setEditedCategory] = useState(category);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">Current Icon:</span>
              <div className="w-6 h-6 text-green-500">
                {editedCategory.icon ? renderIcon(editedCategory.icon) : 'None'}
              </div>
            </div>
            <button
              onClick={() => setIsIconPickerOpen(true)}
              className="px-3 py-1 bg-green-900/30 border border-green-800 rounded-lg text-green-400 hover:bg-green-900/50"
            >
              Select Icon
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-green-900 text-green-100 rounded-lg hover:bg-green-800"
          >
            Save Changes
          </button>
        </div>
      </div>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onIconSelect={(iconName) => setEditedCategory(prev => ({ ...prev, icon: iconName }))}
      />
    </div>
  );
};

export default EditFolderModal;
