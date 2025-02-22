// app/lib/components/categories-management/components/FileExplorerItem.js
import { ChevronDown, ChevronRight, CheckSquare, Square, File, Edit2 } from 'lucide-react';
import { renderIcon } from '../icons';

const FileExplorerItem = ({ 
  item, 
  depth = 0, 
  selectedItems,
  expandedFolders,
  onToggleSelect,
  onToggleExpand,
  isFolder,
  editMode,
  onEdit,
  iconName = 'folder'
}) => {
  const isSelected = selectedItems.has(item.id);
  const isExpanded = expandedFolders.has(item.id);
  const paddingLeft = depth * 20 + 12;

  const handleItemClick = (e) => {
    e.stopPropagation();
    if (editMode) {
      onToggleSelect(item.id);
    } else if (isFolder) {
      onToggleExpand(item.id);
    }
  };

  return (
    <div
      className={`group cursor-pointer select-none ${
        isSelected ? 'bg-green-900/30' : 'hover:bg-green-900/20'
      }`}
      onClick={handleItemClick}
    >
      <div 
        className="flex items-center py-2 px-3 justify-between" 
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center flex-1 min-w-0">
          {isFolder && (
            <div 
              className="mr-2 text-green-500 hover:text-green-400"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}

          {editMode && (
            <div className="w-4 h-4 mr-2">
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-green-500" />
              ) : (
                <Square className="w-4 h-4 text-green-600 group-hover:text-green-500" />
              )}
            </div>
          )}

          {isFolder ? (
            <div className="text-green-500 mr-2">
              {renderIcon(iconName)}
            </div>
          ) : (
            <File className="w-4 h-4 text-green-500 mr-2" />
          )}

          <span className="text-green-400 truncate">{item.name}</span>
          
          {!isFolder && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-green-600 text-sm hover:text-green-400 truncate flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              {item.link}
            </a>
          )}
        </div>

        {/* Edit Controls */}
        {editMode && (
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="text-green-500 hover:text-green-400 p-1 rounded hover:bg-green-900/30"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorerItem;