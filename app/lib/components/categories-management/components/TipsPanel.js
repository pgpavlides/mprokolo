// app/lib/components/categories-management/components/TipsPanel.js
import { Info } from 'lucide-react';

const TipsPanel = () => {
  return (
    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-medium text-blue-400">Tips</h3>
      </div>
      <ul className="text-blue-300 text-sm space-y-2">
        <li>• Click folders to expand/collapse</li>
        <li>• Use edit mode to manage items</li>
        <li>• Click edit icon to modify items</li>
        <li>• Use search to filter content</li>
      </ul>
    </div>
  );
};

export default TipsPanel;