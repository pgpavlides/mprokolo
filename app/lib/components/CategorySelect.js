import React from 'react';

const CategorySelect = ({ selectedCategory, setSelectedCategory, categories }) => {
  return (
    <select
      value={selectedCategory || ''}
      onChange={(e) => setSelectedCategory(e.target.value)}
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