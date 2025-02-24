// File path: app/lib/components/LinkGrid.js

import LinkCard from './LinkCard';
import { CheckSquare } from 'lucide-react';

const LinkGrid = ({ links, editMode, selectedLinks, onLinkSelect, onEditLink }) => {
  // Generate a unique ID if none exists
  const ensureUniqueId = (link) => {
    if (!link.id || typeof link.id === 'number') {
      return {
        ...link,
        id: `link_${link.name}_${link.link}_${Date.now()}`
      };
    }
    return link;
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((link) => {
          const linkWithId = ensureUniqueId(link);
          const isSelected = editMode && selectedLinks.has(linkWithId.id);
          
          return (
            <div
              key={linkWithId.id}
              onClick={() => onLinkSelect(linkWithId.id)}
              className={`relative cursor-pointer transition-transform duration-200 ${
                isSelected ? 'scale-95' : ''
              }`}
            >
              <LinkCard link={linkWithId} editMode={editMode} onEdit={onEditLink} />
              {isSelected && (
                <>
                  <div className="absolute inset-0 bg-green-500/30 pointer-events-none"></div>
                  <div className="absolute top-2 right-2">
                    <CheckSquare className="w-5 h-5 text-green-400" />
                  </div>
                </>
              )}
            </div>
          );
        })}
        {links.length === 0 && (
          <div className="col-span-full text-center text-green-600 py-8">
            No links found
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkGrid;