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

  // Load data from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem("mprokolo-library-links");
    const savedCategories = localStorage.getItem("mprokolo-library-categories");

    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  // Save data to localStorage when it changes
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

  // Filter links based on search and category
  const filteredLinks = useMemo(() => {
    return links.filter(link => 
      (searchTerm === "" || 
        link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "" || link.category === selectedCategory)
    );
  }, [links, searchTerm, selectedCategory]);

  // Pagination
  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * LinksPerPage;
    return filteredLinks.slice(startIndex, startIndex + LinksPerPage);
  }, [filteredLinks, currentPage]);

  const totalPages = Math.ceil(filteredLinks.length / LinksPerPage);

  const handleAddLink = (newLink) => {
    if (!newLink.thumbnail) {
      try {
        const url = new URL(newLink.link);
        newLink.thumbnail = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
      } catch {
        newLink.thumbnail = "/placeholder-image.png";
      }
    }

    const linkToAdd = {
      ...newLink,
      id: Date.now()
    };

    setLinks(prev => [...prev, linkToAdd]);
    setIsAddLinkModalOpen(false);
  };

  const handleCategoriesUpdate = (updatedCategories) => {
    setCategories(updatedCategories);
    setIsCategoriesModalOpen(false);
  };

  const toggleLinkSelection = (linkId) => {
    if (!editMode) return;
    
    setSelectedLinks(prev => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.add(linkId);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedLinks.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedLinks.size} selected link(s)?`)) {
      const updatedLinks = links.filter(link => !selectedLinks.has(link.id));
      setLinks(updatedLinks);
      setSelectedLinks(new Set());
    }
  };

  const selectAllLinks = () => {
    if (selectedLinks.size === paginatedLinks.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(paginatedLinks.map(link => link.id)));
    }
  };

  return (
    <>
      <MatrixRain />
      <div className="min-h-screen bg-transparent p-6">
        {/* Back button */}
        <div className="w-full max-w-6xl mx-auto mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
        </div>

        {/* Top Bar */}
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
        />

        {/* Links Grid */}
        <LinkGrid 
          links={paginatedLinks}
          editMode={editMode}
          selectedLinks={selectedLinks}
          onLinkSelect={toggleLinkSelection}
        />

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Modals */}
        <AddLinkModal 
          isOpen={isAddLinkModalOpen}
          onClose={() => setIsAddLinkModalOpen(false)}
          onAddLink={handleAddLink}
          categories={categories}
        />

        {isCategoriesModalOpen && (
          <CategoriesManagement
            isOpen={true}
            onClose={() => setIsCategoriesModalOpen(false)}
            existingCategories={categories}
            onCategoriesUpdate={handleCategoriesUpdate}
          />
        )}
      </div>
    </>
  );
}