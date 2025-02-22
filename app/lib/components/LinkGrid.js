import LinkCard from './LinkCard';

const LinkGrid = ({ links, editMode, selectedLinks, onLinkSelect }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((link) => (
          <div
            key={link.id}
            onClick={() => onLinkSelect(link.id)}
            className={`relative cursor-pointer transition-transform duration-200 ${
              editMode && selectedLinks.has(link.id) ? 'scale-95' : ''
            }`}
          >
            {editMode && (
              <div 
                className={`absolute inset-0 z-10 bg-green-900/20 rounded-lg transition-opacity duration-200 ${
                  selectedLinks.has(link.id) ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute top-2 right-2 w-4 h-4 border rounded flex items-center justify-center">
                  {selectedLinks.has(link.id) && (
                    <div className="w-2 h-2 bg-green-400 rounded-sm" />
                  )}
                </div>
              </div>
            )}
            <LinkCard link={link} />
          </div>
        ))}
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