import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="w-full max-w-6xl mx-auto flex justify-center items-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg 
                 disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 
                 transition-colors"
        title="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-green-400">
        Page {currentPage} of {totalPages || 1}
      </span>
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg 
                 disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-400 
                 transition-colors"
        title="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;