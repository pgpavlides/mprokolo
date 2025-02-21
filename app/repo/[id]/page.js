"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { generateTreeText } from "../utils/treeUtils";
import { generateMarkdown } from "../utils/createMdUtils";
import ExportModal from "../components/ExportModal";
import LoadingProgress from "../components/LoadingProgress";
import FileSelector from "../components/FileSelector";
import RepositoryInfo from "../components/RepositoryInfo";
import QuickActions from "../components/QuickActions";
import FileTree from "../components/FileTree";

export default function RepoDetail({ params }) {
  const { id } = use(params);
  const [repo, setRepo] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  const [latestCommit, setLatestCommit] = useState(null);
  const [progressState, setProgressState] = useState({
    isGenerating: false,
    current: 0,
    total: 0,
    currentFile: "",
    isComplete: false,
  });

  useEffect(() => {
    if (id) {
      fetchRepoDetails();
    }
  }, [id]);

  const fetchRepoDetails = async () => {
    try {
      setLoading(true);
      
      const repoResponse = await fetch(`/api/repo?id=${id}`);
      if (!repoResponse.ok) {
        const errorData = await repoResponse.json();
        throw new Error(`Failed to fetch repository: ${errorData.error || repoResponse.statusText}`);
      }
      const repoData = await repoResponse.json();
      setRepo(repoData);

      const commitResponse = await fetch(`/api/repo/commits?repo=${repoData.full_name}&per_page=1`);
      if (!commitResponse.ok) {
        throw new Error("Failed to fetch commit information");
      }
      const [latestCommitData] = await commitResponse.json();
      setLatestCommit(latestCommitData);

      const treeResponse = await fetch(`/api/repo/tree?repo=${repoData.full_name}`);
      if (!treeResponse.ok) {
        const errorData = await treeResponse.json();
        throw new Error(`Failed to fetch repository tree: ${errorData.error || treeResponse.statusText}`);
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

  const handleCopyTree = () => {
    const treeText = generateTreeText(treeData);
    navigator.clipboard.writeText(treeText);
    showToast("Tree structure copied to clipboard!");
  };

  const handleCreateMd = () => {
    setIsExportModalOpen(true);
  };

  const handleSelectFiles = () => {
    setIsFileSelectorOpen(true);
  };

  const handleSelectedFilesExport = async (selectedTreeData, type) => {
    if (type === 'copy') {
      const treeText = generateTreeText(selectedTreeData);
      await navigator.clipboard.writeText(treeText);
      showToast("Selected files copied to clipboard!");
      return;
    }

    setProgressState({
      isGenerating: true,
      current: 0,
      total: selectedTreeData.length,
      currentFile: "Preparing...",
      isComplete: false,
    });

    try {
      const options = {
        excludedFolders: [],
        excludedFiles: [],
        excludedFileTypes: [],
      };

      const markdown = await generateMarkdown(
        selectedTreeData,
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

      await navigator.clipboard.writeText(markdown);
      
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repo.name}-selected-files.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        showToast("Selected files exported successfully!");
        setProgressState((prev) => ({ ...prev, isGenerating: false }));
      }, 1000);
    } catch (error) {
      console.error("Error exporting selected files:", error);
      showToast("Error exporting files");
      setProgressState((prev) => ({ ...prev, isGenerating: false }));
    }
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

      await navigator.clipboard.writeText(markdown);
      
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repo.name}-documentation.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500">
        <div className="bg-red-950/20 border border-red-900 rounded-lg p-4">
          {error}
        </div>
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
        folders={treeData.filter(item => item.type === "tree").map(item => item.path)}
      />

      <FileSelector
        isOpen={isFileSelectorOpen}
        onClose={() => setIsFileSelectorOpen(false)}
        treeData={treeData}
        onExport={handleSelectedFilesExport}
        repoName={repo.name}
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
            <RepositoryInfo repo={repo} latestCommit={latestCommit} />
            <QuickActions
              onCopyTree={handleCopyTree}
              onCreateMd={handleCreateMd}
              onSelectFiles={handleSelectFiles}
            />
          </div>
          <FileTree treeData={treeData} />
        </div>
      </div>
    </div>
  );
}