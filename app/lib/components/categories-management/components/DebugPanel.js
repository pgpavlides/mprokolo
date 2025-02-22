// app/lib/components/categories-management/components/DebugPanel.js
import { useState } from 'react';
import { Bug, Plus, Loader2 } from 'lucide-react';

const DebugPanel = ({ onAddRandomLinks }) => {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddLinks = async () => {
    setLoading(true);
    await onAddRandomLinks(count);
    setLoading(false);
  };

  return (
    <div className="bg-red-950/20 border border-red-900 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-medium text-red-400">Debug Tools</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-24 bg-black border border-red-800 rounded-lg p-2 text-red-400"
          />
          <button
            onClick={handleAddLinks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg 
                     hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Add Random Links</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;