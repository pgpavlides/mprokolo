// app/lib/components/categories-management/components/IconPickerModal.js
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { availableIcons, renderIcon } from '../icons';

const IconPickerModal = ({ isOpen, onClose, onIconSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  if (!isOpen) return null;

  const iconEntries = Object.entries(availableIcons);
  const filteredIcons = iconEntries.filter(([iconName]) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-green-400">Select an Icon</h3>
          <button onClick={onClose} className="text-green-500 hover:text-green-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
          <input 
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
          />
        </div>
        <div className="grid grid-cols-6 gap-4">
          {filteredIcons.map(([iconName]) => (
            <button
              key={iconName}
              onClick={() => {
                onIconSelect(iconName);
                onClose();
              }}
              className="p-2 border border-green-800 rounded-lg hover:bg-green-900/30 flex flex-col items-center justify-center"
            >
              <div className="text-green-500 w-8 h-8 flex items-center justify-center">
                {renderIcon(iconName)}
              </div>
              <span className="text-xs text-green-400 mt-1">{iconName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
