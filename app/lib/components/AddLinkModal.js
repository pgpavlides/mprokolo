import { useState } from 'react';
import { X } from 'lucide-react';

const AddLinkModal = ({ isOpen, onClose, onAddLink, categories }) => {
  const [newLink, setNewLink] = useState({
    name: "",
    link: "",
    category: "",
    description: "",
    tags: "",
    thumbnail: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLink.name || !newLink.link) {
      alert("Name and Link are required");
      return;
    }

    const processedTags = newLink.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    // Find the full category object based on the selected value
    const selectedCategory = categories.find(cat => cat.name === newLink.category);

    onAddLink({
      ...newLink,
      tags: processedTags,
      category: selectedCategory || "", // Store the entire category object if found
    });

    // Reset form
    setNewLink({
      name: "",
      link: "",
      category: "",
      description: "",
      tags: "",
      thumbnail: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-black border border-green-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-400">Add New Link</h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Link Name *"
            value={newLink.name}
            onChange={(e) => setNewLink((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
            required
          />
          <input
            type="url"
            placeholder="URL *"
            value={newLink.link}
            onChange={(e) => setNewLink((prev) => ({ ...prev, link: e.target.value }))}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
            required
          />
          <input
            type="url"
            placeholder="Thumbnail URL (optional)"
            value={newLink.thumbnail}
            onChange={(e) => setNewLink((prev) => ({ ...prev, thumbnail: e.target.value }))}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
          />
          <select
            value={newLink.category || ''}
            onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={newLink.description}
            onChange={(e) => setNewLink((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
            rows="3"
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newLink.tags}
            onChange={(e) => setNewLink((prev) => ({ ...prev, tags: e.target.value }))}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
          />
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-green-900 text-green-100 rounded-lg hover:bg-green-800 transition-colors"
            >
              Add Link
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;