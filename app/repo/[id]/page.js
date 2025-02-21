"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import {
  FileDown,
  Copy,
  Github,
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  Download,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitMerge,
  History,
  Settings,
  Share2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { generateTreeText } from "../utils/treeUtils";
import { generateMarkdown } from "../utils/createMdUtils";
import ExportModal from "../components/ExportModal";
import LoadingProgress from "../components/LoadingProgress";

export default function RepoDetail({ params }) {
  const { id } = use(params);
  const [repo, setRepo] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [progressState, setProgressState] = useState({
    isGenerating: false,
    current: 0,
    total: 0,
    currentFile: "",
    isComplete: false,
  });

  const languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Python: "#3572A5",
    Java: "#b07219",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    PHP: "#4F5D95",
    default: "#4F5D95",
  };

  useEffect(() => {
    if (id) {
      fetchRepoDetails();
    }
  }, [id]);

  const fetchRepoDetails = async () => {
    try {
      setLoading(true);

      // Fetch repository details
      const repoResponse = await fetch(`/api/repo?id=${id}`);
      if (!repoResponse.ok) {
        const errorData = await repoResponse.json();
        throw new Error(
          `Failed to fetch repository: ${
            errorData.error || repoResponse.statusText
          }`
        );
      }
      const repoData = await repoResponse.json();
      setRepo(repoData);

      // Fetch repository tree
      const treeResponse = await fetch(
        `/api/repo/tree?repo=${repoData.full_name}`
      );
      if (!treeResponse.ok) {
        const errorData = await treeResponse.json();
        throw new Error(
          `Failed to fetch repository tree: ${
            errorData.error || treeResponse.statusText
          }`
        );
      }
      const { tree } = await treeResponse.json();
      setTreeData(tree || []);
    } catch (error) {
      console.error("Error fetching repo details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const getFolders = () => {
    return treeData
      .filter((item) => item.type === "tree")
      .map((item) => item.path);
  };

  const handleCopyTree = () => {
    const treeText = generateTreeText(treeData);
    navigator.clipboard.writeText(treeText);
    showToast("Tree structure copied to clipboard!");
  };

  const handleCreateMd = () => {
    setIsExportModalOpen(true);
  };

  const handleExport = async (options) => {
    setIsExportModalOpen(false);
    setProgressState({
      isGenerating: true,
      current: 0,
      total: 0,
      currentFile: "Preparing...",
      isComplete: false,
    });

    try {
      const markdown = await generateMarkdown(
        treeData,
        options,
        repo.full_name,
        (progress) => {
          setProgressState({
            isGenerating: true,
            current: progress.current,
            total: progress.total,
            currentFile: progress.fileName,
            isComplete: progress.isComplete,
          });
        }
      );

      // Copy to clipboard
      await navigator.clipboard.writeText(markdown);

      // Create and download the file
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repo.name}-documentation.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success toast after a brief delay to show completion
      setTimeout(() => {
        showToast("Documentation generated and downloaded!");
        setProgressState((prev) => ({ ...prev, isGenerating: false }));
      }, 1000);
    } catch (error) {
      console.error("Error generating markdown:", error);
      showToast("Error generating documentation");
      setProgressState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handlePlaceholder = (action) => {
    showToast(`${action} functionality coming soon!`);
  };

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const CardButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="bg-black border border-green-800 rounded-lg p-2 flex flex-col items-center justify-center gap-1 hover:border-green-400 transition-colors duration-200"
    >
      <Icon className="w-4 h-4 text-green-500" />
      <span className="text-xs font-medium text-green-400">{label}</span>
    </button>
  );

  const renderTreeItem = (item) => {
    const isFolder = item.type === "tree";
    const isExpanded = expandedFolders.has(item.path);

    return (
      <div key={item.path} className="flex flex-col">
        <div
          className="flex items-center p-2 hover:bg-green-900/30 cursor-pointer rounded transition-colors duration-200"
          onClick={() => isFolder && toggleFolder(item.path)}
        >
          {isFolder ? (
            isExpanded ? (
              <ChevronDown className="w-5 h-5 text-green-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-green-400" />
            )
          ) : (
            <span className="w-5" />
          )}
          {isFolder ? (
            <Folder className="w-5 h-5 mr-2 text-green-400" />
          ) : (
            <File className="w-5 h-5 mr-2 text-green-500" />
          )}
          <span className="flex-1 text-green-400 truncate">
            {item.path.split("/").pop()}
          </span>
        </div>
        {isFolder && isExpanded && (
          <div className="ml-4 border-l border-green-800">
            {treeData
              .filter((child) => child.path.startsWith(item.path + "/"))
              .map(renderTreeItem)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-green-500">
        Repository not found
      </div>
    );
  }

  const rootLevelItems = treeData.filter((item) => !item.path.includes("/"));

  const actions = [
    { icon: Copy, label: "Copy Tree", handler: handleCopyTree },
    { icon: FileDown, label: "Create MD", handler: handleCreateMd },
  ];

  return (
    <div className="h-screen w-screen bg-black text-green-400 overflow-hidden">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-900 text-green-100 px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        folders={getFolders()}
      />

      {progressState.isGenerating && (
        <LoadingProgress
          current={progressState.current}
          total={progressState.total}
          currentFileName={progressState.currentFile}
          isComplete={progressState.isComplete}
        />
      )}

      <div className="h-16 border-b border-green-800 px-4 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-green-400 hover:text-green-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Repositories</span>
        </Link>
      </div>

      <div className="h-[calc(100vh-4rem)] p-4">
        <div className="grid grid-cols-3 gap-4 h-full">
          <div className="flex flex-col gap-4">
            <div className="bg-black border border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Github className="w-6 h-6 text-green-500" />
                <h1 className="text-xl font-bold text-green-400 truncate">
                  {repo.full_name}
                </h1>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        languageColors[repo.language] || languageColors.default,
                    }}
                  />
                  <span className="text-green-400">
                    {repo.language || "Unknown"}
                  </span>
                </div>
                {repo.size && (
                  <span className="text-green-600">
                    • {(repo.size / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>

            <div className="bg-black border border-green-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                  <CardButton
                    key={action.label}
                    icon={action.icon}
                    label={action.label}
                    onClick={action.handler}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-black border border-green-800 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-green-400">
                Repository Structure
              </h2>
            </div>
            <div className="overflow-auto flex-1 rounded border border-green-800/50">
              <div className="p-2">{rootLevelItems.map(renderTreeItem)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
