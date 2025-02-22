// app/lib/components/categories-management/components/StatisticsPanel.js
const StatisticsPanel = ({ categories, links, selectedItems }) => {
    const uncategorizedCount = links.filter(link => !link.category).length;
  
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-green-400 mb-4">Statistics</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-green-600">Total Categories:</span>
            <span className="text-green-400">{categories.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-600">Total Links:</span>
            <span className="text-green-400">{links.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-600">Selected Items:</span>
            <span className="text-green-400">{selectedItems.size}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-600">Uncategorized:</span>
            <span className="text-green-400">{uncategorizedCount}</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default StatisticsPanel;