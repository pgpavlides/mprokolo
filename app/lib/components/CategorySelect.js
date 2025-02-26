// Update to the CategorySelect.js component
// app/lib/components/CategorySelect.js

import React from 'react';

const CategorySelect = ({ selectedCategory, setSelectedCategory, categories, resetPage }) => {
  // This function now handles both updating the category and resetting the page
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Reset to page 1 whenever category changes
    resetPage();
  };

  return (
    <select
      value={selectedCategory || ''}
      onChange={handleCategoryChange}
      className="min-w-40 bg-black/50 border border-green-800 rounded-lg px-4 py-2 text-green-400"
    >
      <option value="">All Categories</option>
      {categories.map(category => (
        <option key={category.id} value={category.name}>
          {category.name}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;