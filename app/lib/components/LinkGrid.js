// app/lib/components/LinkGrid.js
import LinkCard from './LinkCard';
import { CheckSquare } from 'lucide-react';

const LinkGrid = ({ links, editMode, selectedLinks, onLinkSelect, onEditLink }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((link) => {
          const isSelected = editMode && selectedLinks.has(link.id);
          return (
            <div
              key={link.id}
              onClick={() => onLinkSelect(link.id)}
              className={`relative cursor-pointer transition-transform duration-200 ${
                isSelected ? 'scale-95' : ''
              }`}
            >
              <LinkCard link={link} editMode={editMode} onEdit={onEditLink} />
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
