import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

export default function FileTree({ treeData }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

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

  const rootLevelItems = treeData.filter((item) => !item.path.includes("/"));

  return (
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
  );
}