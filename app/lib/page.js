"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
} from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import CategoriesManagement from "@/components/CategoriesManagement";

const dummyLinks = [
  {
    id: 1,
    name: "GitHub",
    link: "https://github.com",
    category: "Development",
    description: "Platform for version control and collaboration",
    tags: ["code", "repository"],
    thumbnail:
      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  },
  {
    id: 2,
    name: "Stack Overflow",
    link: "https://stackoverflow.com",
    category: "Development",
    description: "Q&A for professional and enthusiast programmers",
    tags: ["coding", "help"],
    thumbnail: "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico",
  },
  {
    id: 3,
    name: "MDN Web Docs",
    link: "https://developer.mozilla.org",
    category: "Documentation",
    description: "Resource for web developers",
    tags: ["web", "docs"],
    thumbnail: "https://developer.mozilla.org/favicon.ico",
  },
  {
    id: 4,
    name: "Dev.to",
    link: "https://dev.to",
    category: "Community",
    description: "A platform where software developers share ideas",
    tags: ["blog", "community"],
    thumbnail: "https://dev.to/favicon.ico",
  },
  {
    id: 5,
    name: "Medium",
    link: "https://medium.com",
    category: "Writing",
    description: "Online publishing platform",
    tags: ["articles", "writing"],
    thumbnail: "https://medium.com/favicon.ico",
  },
];

const EnhancedLibraryPage = () => {
  // State for links and filtering
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 12; // 6x2 grid

  // Load data from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem("mprokolo-library-links");
    const savedCategories = localStorage.getItem("mprokolo-library-categories");

    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Filtered and paginated links
  const filteredLinks = useMemo(() => {
    return links.filter(
      (link) =>
        (searchTerm === "" ||
          link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === "" || link.category === selectedCategory)
    );
  }, [links, searchTerm, selectedCategory]);

  // Pagination logic
  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * linksPerPage;
    return filteredLinks.slice(startIndex, startIndex + linksPerPage);
  }, [filteredLinks, currentPage]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredLinks.length / linksPerPage);

  // Add link handler
  const handleAddLink = (newLink) => {
    // Try to fetch favicon as thumbnail if not provided
    if (!newLink.thumbnail) {
      try {
        const url = new URL(newLink.link);
        newLink.thumbnail = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
      } catch {
        // Fallback to a default image if URL is invalid
        newLink.thumbnail = "/placeholder-image.png";
      }
    }

    const updatedLinks = [...links, { ...newLink, id: Date.now() }];
    setLinks(updatedLinks);
    localStorage.setItem(
      "mprokolo-library-links",
      JSON.stringify(updatedLinks)
    );
    setIsAddLinkModalOpen(false);
  };

  // Categories update handler
  const handleCategoriesUpdate = (updatedCategories) => {
    setCategories(updatedCategories);
    localStorage.setItem(
      "mprokolo-library-categories",
      JSON.stringify(updatedCategories)
    );
    setIsCategoriesModalOpen(false);
  };

  // Add dummy links
  const addDummyLinks = () => {
    const newLinks = [
      ...links,
      ...dummyLinks.map((link) => ({
        ...link,
        id: Date.now() + Math.random(),
      })),
    ];
    setLinks(newLinks);
    localStorage.setItem("mprokolo-library-links", JSON.stringify(newLinks));
  };

  // Delete all links
  const deleteAllLinks = () => {
    if (window.confirm("Are you sure you want to delete all links?")) {
      setLinks([]);
      localStorage.removeItem("mprokolo-library-links");
    }
  };

  return (
    <>
      <MatrixRain />
      <div className="min-h-screen bg-transparent p-6">
        <div className="container mx-auto">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </Link>

            {/* Debug Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={addDummyLinks}
                className="bg-green-900/30 border border-green-800 text-green-400 px-3 py-2 rounded-lg hover:border-green-400 transition"
              >
                Add Dummy Links
              </button>
              <button
                onClick={deleteAllLinks}
                className="bg-red-900/30 border border-red-800 text-red-400 px-3 py-2 rounded-lg hover:border-red-400 transition"
              >
                Delete All Links
              </button>
            </div>
          </div>

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            {/* Left Side - Search and Category */}
            <div className="flex items-center space-x-4 w-full">
              {/* Search Input */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 backdrop-blur-sm border border-green-800 rounded-lg text-green-400 placeholder-green-700"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/50 backdrop-blur-sm border border-green-800 rounded-lg px-4 py-2 text-green-400"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Side - Add and Categories Buttons */}
            <div className="flex items-center space-x-4 ml-4">
              <button
                onClick={() => setIsAddLinkModalOpen(true)}
                className="bg-green-900/30 border border-green-800 text-green-400 p-2 rounded-lg hover:border-green-400 transition"
              >
                <Plus />
              </button>
              <button
                onClick={() => setIsCategoriesModalOpen(true)}
                className="bg-green-900/30 border border-green-800 text-green-400 p-2 rounded-lg hover:border-green-400 transition"
              >
                <Settings />
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-6 gap-2 mb-10">
            {paginatedLinks.map((link) => (
              <div
                key={link.id}
                className="card group relative mb-12"
                onClick={() => window.open(link.link, "_blank")}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm">Open Link</span>
                </div>
                <img
                  src={link.thumbnail || "/placeholder-image.png"}
                  alt={`${link.name} thumbnail`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-green-900/80 p-2 rounded-b-lg">
                  <h3 className="heading text-white truncate">{link.name}</h3>
                  <p className="text-green-300 truncate">
                    {link.category || "Uncategorized"}
                  </p>
                  <p className="text-green-400 text-xs truncate">
                    {link.tags?.join(", ") || "No tags"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-green-900/30 border border-green-800 text-green-400 p-2 rounded-lg disabled:opacity-50 hover:border-green-400"
            >
              <ChevronLeft />
            </button>
            <span className="text-green-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-green-900/30 border border-green-800 text-green-400 p-2 rounded-lg disabled:opacity-50 hover:border-green-400"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Categories Management Modal */}
          {isCategoriesModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
              <div className="w-full max-w-2xl bg-black border border-green-800 rounded-lg p-8">
                <CategoriesManagement
                  isOpen={true}
                  onClose={() => setIsCategoriesModalOpen(false)}
                  existingCategories={categories}
                  onCategoriesUpdate={handleCategoriesUpdate}
                />
              </div>
            </div>
          )}

          {/* Add Link Modal */}
          {isAddLinkModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-black border border-green-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-green-400">
                    Add New Link
                  </h2>
                  <button
                    onClick={() => setIsAddLinkModalOpen(false)}
                    className="text-green-500"
                  >
                    <X />
                  </button>
                </div>
                <AddLinkForm
                  categories={categories}
                  onAddLink={handleAddLink}
                  onCancel={() => setIsAddLinkModalOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Separate component for Add Link Form
const AddLinkForm = ({ categories, onAddLink, onCancel }) => {
  const [newLink, setNewLink] = useState({
    name: "",
    link: "",
    category: "",
    description: "",
    tags: "",
    thumbnail: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!newLink.name || !newLink.link) {
      alert("Name and Link are required");
      return;
    }

    // Process tags
    const processedTags = newLink.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    onAddLink({
      ...newLink,
      tags: processedTags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Link Name *"
        value={newLink.name}
        onChange={(e) =>
          setNewLink((prev) => ({ ...prev, name: e.target.value }))
        }
        className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
        required
      />
      <input
        type="url"
        placeholder="URL *"
        value={newLink.link}
        onChange={(e) =>
          setNewLink((prev) => ({ ...prev, link: e.target.value }))
        }
        className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
        required
      />
      <input
        type="url"
        placeholder="Thumbnail URL (optional)"
        value={newLink.thumbnail}
        onChange={(e) =>
          setNewLink((prev) => ({ ...prev, thumbnail: e.target.value }))
        }
        className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
      />
      <select
        value={newLink.category}
        onChange={(e) =>
          setNewLink((prev) => ({ ...prev, category: e.target.value }))
        }
        className="w-full  bg-black border border-green-800 rounded-lg p-2 text-green-400"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Description"
        value={newLink.description}
        onChange={(e) =>
          setNewLink((prev) => ({ ...prev, description: e.target.value }))
        }
        className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
        rows="3"
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={newLink.tags}
        onChange={(e) =>
          setNewLink((prev) => ({ ...prev, tags: e.target.value }))
        }
        className="w-full bg-black border border-green-800 rounded-lg p-2 text-green-400 placeholder-green-700"
      />
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-green-900 text-green-100 px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Add Link
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-green-900/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-900/50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EnhancedLibraryPage;