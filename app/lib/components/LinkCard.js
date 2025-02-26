// app/lib/components/LinkCard.js
import { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { getCachedImage, setCachedImage } from '../utils/imageCache';

const LinkCard = ({ link, editMode, onEdit, tabIndex }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadPreview = async () => {
      if (!link.link || imageError) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to use the thumbnail if provided directly
        if (link.thumbnail) {
          if (isMounted) {
            setPreviewImage(link.thumbnail);
            setIsLoading(false);
          }
          return;
        }

        // Check cache next
        const cachedImage = getCachedImage(link.link);
        if (cachedImage) {
          if (isMounted) {
            setPreviewImage(cachedImage);
            setIsLoading(false);
          }
          return;
        }

        // Create fallback image URL from domain favicon
        let fallbackImage;
        try {
          const url = new URL(link.link);
          fallbackImage = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
        } catch (urlError) {
          fallbackImage = '/globe.svg'; // Use local fallback if URL is invalid
        }

        // Try to fetch from API
        try {
          const response = await fetch(`/api/linkPreview?url=${encodeURIComponent(link.link)}`);
          if (!response.ok) throw new Error('Failed to fetch preview');
          
          const data = await response.json();
          
          if (isMounted && data.image) {
            setPreviewImage(data.image);
            // Cache the image URL
            setCachedImage(link.link, data.image);
          } else {
            throw new Error('No image in response');
          }
        } catch (apiError) {
          console.warn('API fetch error, using fallback:', apiError);
          if (isMounted) {
            setPreviewImage(fallbackImage);
            setCachedImage(link.link, fallbackImage);
          }
        }
      } catch (error) {
        console.error('Error loading preview:', error);
        if (isMounted) {
          setImageError(true);
          let fallbackImage = '/globe.svg';
          try {
            const url = new URL(link.link);
            fallbackImage = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
          } catch (e) {
            // Keep default fallback
          }
          setPreviewImage(fallbackImage);
          setCachedImage(link.link, fallbackImage);
        }
      } finally {
        if (isMounted) {
          // Keep loading state for a minimum time to avoid flashing
          setTimeout(() => setIsLoading(false), 300);
        }
      }
    };

    setIsLoading(true);
    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [link.link, link.thumbnail, imageError]);

  const categoryName =
    typeof link.category === 'string'
      ? link.category
      : link.category?.name || 'Uncategorized';

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (editMode) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(link.link, "_blank");
    }
  };

  return (
    <div
      className={`relative h-48 bg-black border rounded-lg overflow-hidden group cursor-pointer flex flex-col
                ${isFocused ? 'border-green-400 ring-2 ring-green-500/50' : 'border-green-800'}`}
      onClick={() => {
        if (!editMode) window.open(link.link, "_blank");
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={tabIndex || 0}
      role="link"
      aria-label={`${link.name} - ${categoryName}`}
      onKeyDown={handleKeyDown}
    >
      {/* Top section: Image container */}
      <div className="relative h-32 overflow-hidden bg-black flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {previewImage ? (
              <div className="w-full h-full bg-black flex items-center justify-center p-4">
                <img
                  src={previewImage}
                  alt={link.name}
                  className="max-w-full max-h-full object-contain"
                  onError={() => {
                    setImageError(true);
                    let fallbackImage = '/globe.svg';
                    try {
                      const url = new URL(link.link);
                      fallbackImage = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
                    } catch (e) {
                      // Keep default fallback
                    }
                    setPreviewImage(fallbackImage);
                    setCachedImage(link.link, fallbackImage);
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-green-500/50" />
              </div>
            )}
          </>
        )}

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

        <div className={`absolute inset-0 transition-opacity bg-black/50 flex items-center justify-center
                       ${(isFocused || link.isFocused) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <span className="text-white text-sm flex items-center gap-1">
            <ExternalLink className="w-4 h-4" />
            Open Link
          </span>
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