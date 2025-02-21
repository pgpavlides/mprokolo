import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const DEFAULT_EXCLUDED_FOLDERS = [
  "build",
  ".git",
  "dist",
  "node_modules",
  ".next",
];
const DEFAULT_EXCLUDED_FILES = ["package-lock.json"];
const DEFAULT_EXCLUDED_TYPES = [
  // Documentation files
  "md",
  // Image files
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "webp",
  "ico",
  "tiff",
  "raw",
  "heic",
  "heif",
  "avif",
  "psd",
  "ai",
  "eps",
  "sketch",
  // 3D files
  "glb",
  "gltf",
  "fbx",
  "obj",
  "stl",
  // Audio files
  "mp3",
  "wav",
  "ogg",
  "flac",
  "m4a",
  "aac",
  "wma",
  "aiff",
  "alac",
  "mid",
  "midi",
  "ac3",
  "amr",
  "ape",
  "au",
  "mka",
  "ra",
  "voc",
  // Audio project files
  "aup",
  "sesx",
  "als",
  "flp",
  "band",
  "logic",
  "ptx",
  "rpp",
];

const FILE_TYPE_GROUPS = {
  documentation: ["md"],
  images: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "svg",
    "webp",
    "ico",
    "tiff",
    "raw",
    "heic",
    "heif",
    "avif",
    "psd",
    "ai",
    "eps",
    "sketch",
  ],
  models3d: ["glb", "gltf", "fbx", "obj", "stl"],
  audio: [
    "mp3",
    "wav",
    "ogg",
    "flac",
    "m4a",
    "aac",
    "wma",
    "aiff",
    "alac",
    "mid",
    "midi",
    "ac3",
    "amr",
    "ape",
    "au",
    "mka",
    "ra",
    "voc",
  ],
  audioProjects: ["aup", "sesx", "als", "flp", "band", "logic", "ptx", "rpp"],
};

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  folders = [],
}) {
  // Default checked state for common exclusions
  const [defaultExclusionsEnabled, setDefaultExclusionsEnabled] =
    useState(true);

  // Custom exclusions
  const [customFolders, setCustomFolders] = useState([]);
  const [customFiles, setCustomFiles] = useState([]);
  const [customTypes, setCustomTypes] = useState([]);

  // Input states
  const [newFolder, setNewFolder] = useState("");
  const [newFile, setNewFile] = useState("");
  const [newType, setNewType] = useState("");

  const handleSubmit = () => {
    const exclusions = {
      excludedFolders: [
        ...(defaultExclusionsEnabled ? DEFAULT_EXCLUDED_FOLDERS : []),
        ...customFolders,
      ],
      excludedFiles: [
        ...(defaultExclusionsEnabled ? DEFAULT_EXCLUDED_FILES : []),
        ...customFiles,
      ],
      excludedFileTypes: [
        ...(defaultExclusionsEnabled ? DEFAULT_EXCLUDED_TYPES : []),
        ...customTypes,
      ],
    };
    onExport(exclusions);
    onClose();
  };

  const addItem = (item, list, setList, setNew) => {
    if (item && !list.includes(item)) {
      setList([...list, item]);
      setNew("");
    }
  };

  const removeItem = (item, list, setList) => {
    setList(list.filter((i) => i !== item));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">
            Export Options
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Default Exclusions */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-green-400 mb-2">
            <input
              type="checkbox"
              checked={defaultExclusionsEnabled}
              onChange={(e) => setDefaultExclusionsEnabled(e.target.checked)}
              className="form-checkbox bg-black border-green-800 text-green-500 rounded"
            />
            <span>Use Default Exclusions</span>
          </label>

          {defaultExclusionsEnabled && (
            <div className="pl-6 text-sm text-green-600">
              <p className="mb-1">
                Folders: {DEFAULT_EXCLUDED_FOLDERS.join(", ")}
              </p>
              <p className="mb-1">Files: {DEFAULT_EXCLUDED_FILES.join(", ")}</p>
              <p className="mb-1">Excluded File Types:</p>
              <ul className="list-disc pl-4">
                <li>
                  Documentation: {FILE_TYPE_GROUPS.documentation.join(", ")}
                </li>
                <li>Images: {FILE_TYPE_GROUPS.images.join(", ")}</li>
                <li>3D Models: {FILE_TYPE_GROUPS.models3d.join(", ")}</li>
                <li>Audio: {FILE_TYPE_GROUPS.audio.join(", ")}</li>
                <li>
                  Audio Projects: {FILE_TYPE_GROUPS.audioProjects.join(", ")}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Custom Folder Exclusions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-green-400 mb-2">
            Exclude Additional Folders
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="Enter folder name"
              className="flex-1 bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
            />
            <button
              onClick={() =>
                addItem(
                  newFolder,
                  customFolders,
                  setCustomFolders,
                  setNewFolder
                )
              }
              className="p-2 border border-green-800 rounded hover:border-green-600"
            >
              <Plus className="w-5 h-5 text-green-500" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customFolders.map((folder) => (
              <div
                key={folder}
                className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded"
              >
                <span>{folder}</span>
                <button
                  onClick={() =>
                    removeItem(folder, customFolders, setCustomFolders)
                  }
                >
                  <Trash2 className="w-4 h-4 text-green-500 hover:text-green-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom File Exclusions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-green-400 mb-2">
            Exclude Additional Files
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFile}
              onChange={(e) => setNewFile(e.target.value)}
              placeholder="Enter file name"
              className="flex-1 bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
            />
            <button
              onClick={() =>
                addItem(newFile, customFiles, setCustomFiles, setNewFile)
              }
              className="p-2 border border-green-800 rounded hover:border-green-600"
            >
              <Plus className="w-5 h-5 text-green-500" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customFiles.map((file) => (
              <div
                key={file}
                className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded"
              >
                <span>{file}</span>
                <button
                  onClick={() => removeItem(file, customFiles, setCustomFiles)}
                >
                  <Trash2 className="w-4 h-4 text-green-500 hover:text-green-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom File Type Exclusions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-green-400 mb-2">
            Exclude Additional File Types
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Enter file extension (without dot)"
              className="flex-1 bg-black border border-green-800 rounded p-2 text-green-400 placeholder-green-700"
            />
            <button
              onClick={() =>
                addItem(newType, customTypes, setCustomTypes, setNewType)
              }
              className="p-2 border border-green-800 rounded hover:border-green-600"
            >
              <Plus className="w-5 h-5 text-green-500" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customTypes.map((type) => (
              <div
                key={type}
                className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded"
              >
                <span>{type}</span>
                <button
                  onClick={() => removeItem(type, customTypes, setCustomTypes)}
                >
                  <Trash2 className="w-4 h-4 text-green-500 hover:text-green-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-900 text-green-100 rounded-lg py-2 hover:bg-green-800 transition-colors"
        >
          Generate Markdown
        </button>
      </div>
    </div>
  );
}
