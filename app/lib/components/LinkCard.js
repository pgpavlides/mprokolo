
const LinkCard = ({ link }) => {
    // Handle category display safely
    const categoryName = typeof link.category === 'string' 
      ? link.category 
      : link.category?.name || 'Uncategorized';
  
    return (
      <div
        className="relative h-48 bg-black border border-green-800 rounded-lg overflow-hidden group cursor-pointer"
        onClick={() => window.open(link.link, "_blank")}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 flex items-center justify-center">
          <span className="text-white text-sm">Open Link</span>
        </div>
        <img
          src={link.thumbnail || "/placeholder-image.png"}
          alt={link.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-green-900/80 p-2">
          <h3 className="text-white font-medium truncate">{link.name}</h3>
          <p className="text-green-300 text-sm truncate">
            {categoryName}
          </p>
          <p className="text-green-400 text-xs truncate">
            {link.tags?.join(", ") || "No tags"}
          </p>
        </div>
      </div>
    );
  };
  
  export default LinkCard;