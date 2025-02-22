// app/lib/components/categories-management/components/EditLinkModal.js
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditLinkModal = ({ isOpen, onClose, link, onSave, categories }) => {
  const [editedLink, setEditedLink] = useState(link);
  const [tagInput, setTagInput] = useState(link.tags?.join(', ') || '');

  useEffect(() => {
    setEditedLink(link);
    setTagInput(link.tags?.join(', ') || '');
  }, [link]);

  const handleSave = () => {
    const updatedLink = {
      ...editedLink,
      tags: tagInput.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    onSave(updatedLink);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-green-400">Edit Link</h3>
          <button onClick={onClose} className="text-green-500 hover:text-green-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value={editedLink.name}
            onChange={(e) => setEditedLink(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Link Name"
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
          />
          <input
            type="url"
            value={editedLink.link}
            onChange={(e) => setEditedLink(prev => ({ ...prev, link: e.target.value }))}
            placeholder="URL"
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
          />
          <textarea
            value={editedLink.description || ''}
            onChange={(e) => setEditedLink(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
            rows="3"
          />
          <div>
            <label className="block text-green-400 mb-1">Category</label>
            <select
              value={editedLink.category}
              onChange={(e) => setEditedLink(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
            >
              <option value="Uncategorized">Uncategorized</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
          />
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

export default EditLinkModal;
