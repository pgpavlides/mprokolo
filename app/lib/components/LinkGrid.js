import LinkCard from './LinkCard';

const LinkGrid = ({ links }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
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