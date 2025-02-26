// app/lib/components/ViewToggle.js
import { Grid, FolderTree } from 'lucide-react';

const ViewToggle = ({ viewMode, setViewMode, tabIndex }) => {
  return (
    <div className="inline-flex items-center border border-green-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setViewMode('links')}
        className={`px-3 py-2 flex items-center gap-2 ${
          viewMode === 'links'
            ? 'bg-green-900 text-green-100'
            : 'bg-black/50 text-green-400 hover:bg-green-900/30'
        }`}
        title="Link View"
        tabIndex={tabIndex || 0}
      >
        <Grid className="w-4 h-4" />
        <span className="text-sm">Links</span>
      </button>
      <button
        onClick={() => setViewMode('categories')}
        className={`px-3 py-2 flex items-center gap-2 ${
          viewMode === 'categories'
            ? 'bg-green-900 text-green-100'
            : 'bg-black/50 text-green-400 hover:bg-green-900/30'
        }`}
        title="Category View"
        tabIndex={tabIndex || 0}
      >
        <FolderTree className="w-4 h-4" />
        <span className="text-sm">Categories</span>
      </button>
    </div>
  );
};

export default ViewToggle;