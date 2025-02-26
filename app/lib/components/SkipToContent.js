// app/lib/components/SkipToContent.js
import { useState } from 'react';

const SkipToContent = () => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    
    // Find the grid container and focus it
    const contentContainer = document.querySelector('#grid-container');
    if (contentContainer) {
      contentContainer.focus();
      
      // Focus the first card in the grid
      const firstCard = contentContainer.querySelector('[role="button"], [role="link"]');
      if (firstCard) {
        firstCard.focus();
      }
    }
  };

  return (
    <a
      href="#grid-container"
      onClick={handleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`fixed left-4 z-50 px-4 py-2 bg-green-900 text-white rounded transform transition-transform ${
        isFocused ? 'top-4' : '-top-20'
      }`}
    >
      Skip to content
    </a>
  );
};

export default SkipToContent;