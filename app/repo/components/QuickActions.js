import { Plus, Settings, Edit2 } from 'lucide-react';

const ActionButtons = ({ onAddClick, onSettingsClick, editMode, onEditModeToggle }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onAddClick}
        className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
        title="Add new link"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={onSettingsClick}
        className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
        title="Manage categories"
      >
        <Settings className="w-5 h-5" />
      </button>
      <button
        onClick={onEditModeToggle}
        className={`p-2 border text-green-400 rounded-lg transition-colors ${
          editMode 
            ? 'bg-green-900 border-green-400' 
            : 'bg-green-900/30 border-green-800 hover:border-green-400'
        }`}
        title={editMode ? "Exit edit mode" : "Enter edit mode"}
      >
        <Edit2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ActionButtons;