'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MatrixRain from '@/components/MatrixRain';
import TopBar from './components/TopBar';
import LinkGrid from './components/LinkGrid';
import Pagination from './components/Pagination';
import AddLinkModal from './components/AddLinkModal';
import CategoriesManagement from './components/categories-management';
import EditLinkModal from './components/categories-management/components/EditLinkModal';
import BookmarksSyncModal from './components/BookmarksSyncModal';

const LinksPerPage = 18; // 6x3 grid

export default function LibraryPage() {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState(new Set());
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isBookmarksSyncModalOpen, setIsBookmarksSyncModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem("mprokolo-library-links");
    const savedCategories = localStorage.getItem("mprokolo-library-categories");
    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  // Save data to localStorage when links or categories change
  useEffect(() => {
    localStorage.setItem("mprokolo-library-links", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem("mprokolo-library-categories", JSON.stringify(categories));
  }, [categories]);

  // Reset selected links when exiting edit mode
  useEffect(() => {
    if (!editMode) {
      setSelectedLinks(new Set());
    }
  }, [editMode]);

  // Filter links based on search term and selected category
  const filteredLinks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return links.filter(link =>
      (searchTerm === "" ||
        link.name.toLowerCase().includes(lowerSearch) ||
        link.description?.toLowerCase().includes(lowerSearch) ||
        (Array.isArray(link.tags) &&
          link.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
      ) &&
      (selectedCategory === "" || link.category === selectedCategory)
    );
  }, [links, searchTerm, selectedCategory]);

  // Paginate filtered links
  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * LinksPerPage;
    return filteredLinks.slice(startIndex, startIndex + LinksPerPage);
  }, [filteredLinks, currentPage]);

  const totalPages = Math.ceil(filteredLinks.length / LinksPerPage);

  // Handle adding a new link
  const handleAddLink = (newLink) => {
    const linkToAdd = {
      ...newLink,
      id: `link_${newLink.name}_${newLink.link}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (!linkToAdd.thumbnail) {
      try {
        const url = new URL(linkToAdd.link);
        linkToAdd.thumbnail = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
      } catch {
        linkToAdd.thumbnail = "/placeholder-image.png";
      }
    }

    setLinks(prev => [...prev, linkToAdd]);
    setIsAddLinkModalOpen(false);
  };

  // Handle importing bookmarks
  const handleImportBookmarks = (bookmarks) => {
    // Add new bookmarks to existing links
    setLinks(prevLinks => {
      // Ensure each bookmark has a unique ID
      const processedBookmarks = bookmarks.map(bookmark => ({
        ...bookmark,
        id: `bookmark_${bookmark.name}_${bookmark.link}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // Filter out duplicate bookmarks based on URL
      const newBookmarks = processedBookmarks.filter(newBookmark => 
        !prevLinks.some(existingLink => existingLink.link === newBookmark.link)
      );

      return [...prevLinks, ...newBookmarks];
    });
    
    // Create a notification
    if (bookmarks.length > 0) {
      const message = `Successfully imported ${bookmarks.length} bookmarks!`;
      alert(message);
    }
  };

  // Handle category updates
  const handleCategoriesUpdate = (updatedCategories) => {
    setCategories(updatedCategories);
    setIsCategoriesModalOpen(false);
  };

  // Toggle selection for a given link (used in edit mode)
  const toggleLinkSelection = (linkId) => {
    if (!editMode) return;
    setSelectedLinks(prev => {
      const next = new Set(prev);
      next.has(linkId) ? next.delete(linkId) : next.add(linkId);
      return next;
    });
  };

  // Delete selected links
  const handleDeleteSelected = () => {
    if (selectedLinks.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedLinks.size} selected link(s)?`)) {
      const updatedLinks = links.filter(link => !selectedLinks.has(link.id));
      setLinks(updatedLinks);
      setSelectedLinks(new Set());
    }
  };

  // Select or deselect all visible links
  const selectAllLinks = () => {
    if (selectedLinks.size === paginatedLinks.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(paginatedLinks.map(link => link.id)));
    }
  };

  // Edit link
  const handleEditLink = (link) => {
    setEditingLink(link);
  };

  // Save updated link
  const handleSaveLink = (updatedLink) => {
    const updatedLinks = links.map(link =>
      link.id === updatedLink.id ? updatedLink : link
    );
    setLinks(updatedLinks);
    setEditingLink(null);
  };

  const handleSyncBookmarks = () => {
    setIsBookmarksSyncModalOpen(true);
  };

  return (
    <>
      <MatrixRain />
      <div className="min-h-screen bg-transparent p-6">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/" className="text-green-400 hover:text-green-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="px-4 py-2 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:border-green-400 transition-colors"
          >
            Manage Categories
          </button>
        </div>

        <TopBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onAddClick={() => setIsAddLinkModalOpen(true)}
          onSettingsClick={() => setIsCategoriesModalOpen(true)}
          editMode={editMode}
          onEditModeToggle={() => setEditMode(!editMode)}
          selectedLinks={selectedLinks}
          onSelectAll={selectAllLinks}
          onDeleteSelected={handleDeleteSelected}
          onSyncBookmarks={handleSyncBookmarks}
        />

        <LinkGrid
          links={paginatedLinks}
          editMode={editMode}
          selectedLinks={selectedLinks}
          onLinkSelect={toggleLinkSelection}
          onEditLink={handleEditLink}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {isAddLinkModalOpen && (
          <AddLinkModal
            isOpen={isAddLinkModalOpen}
            onClose={() => setIsAddLinkModalOpen(false)}
            onAddLink={handleAddLink}
            categories={categories}
          />
        )}

        {isCategoriesModalOpen && (
          <CategoriesManagement
            isOpen={isCategoriesModalOpen}
            onClose={() => setIsCategoriesModalOpen(false)}
            existingCategories={categories}
            onCategoriesUpdate={handleCategoriesUpdate}
          />
        )}

        {editingLink && (
          <EditLinkModal
            isOpen={true}
            onClose={() => setEditingLink(null)}
            link={editingLink}
            onSave={handleSaveLink}
            categories={categories}
          />
        )}

        <BookmarksSyncModal
          isOpen={isBookmarksSyncModalOpen}
          onClose={() => setIsBookmarksSyncModalOpen(false)}
          onImport={handleImportBookmarks}
        />
      </div>
    </>
  );
}