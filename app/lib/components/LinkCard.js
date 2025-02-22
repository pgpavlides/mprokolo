// app/lib/components/LinkCard.js
import { Settings } from 'lucide-react';

const LinkCard = ({ link, editMode, onEdit }) => {
  const categoryName =
    typeof link.category === 'string'
      ? link.category
      : link.category?.name || 'Uncategorized';

  return (
    <div
      className="relative h-48 bg-black border border-green-800 rounded-lg overflow-hidden group cursor-pointer flex flex-col"
      onClick={() => {
        if (!editMode) window.open(link.link, "_blank");
      }}
    >
      {/* Top section: Image container */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={link.thumbnail || "/placeholder-image.png"}
          alt={link.name}
          className="w-full h-full object-cover"
        />
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(link);
            }}
            title="Edit Link"
            className="absolute top-2 left-2 z-20 p-1 bg-green-900/50 rounded-full hover:bg-green-900/70 transition-colors"
          >
            <Settings className="w-4 h-4 text-green-400" />
          </button>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 flex items-center justify-center">
          <span className="text-white text-sm">Open Link</span>
        </div>
      </div>
      {/* Bottom section: Data box */}
      <div className="flex-grow bg-green-900/80 p-2">
        <h3 className="text-white font-medium truncate">{link.name}</h3>
        <p className="text-green-300 text-sm truncate">{categoryName}</p>
        <p className="text-green-400 text-xs truncate">
          {link.tags?.join(", ") || "No tags"}
        </p>
      </div>
    </div>
  );
};

export default LinkCard;
