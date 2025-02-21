import { Github, GitCommit } from "lucide-react";

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

export default function RepositoryInfo({ repo, latestCommit }) {
  return (
    <div className="bg-black border border-green-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <Github className="w-6 h-6 text-green-500" />
        <h1 className="text-xl font-bold text-green-400 truncate">
          {repo.full_name}
        </h1>
      </div>
      <div className="flex items-center gap-2 mb-2 text-sm">
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
      {latestCommit && (
        <div className="border-t border-green-800/50 pt-2 mt-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <GitCommit className="w-4 h-4" />
            <span className="truncate">{latestCommit.commit.message}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-green-700">
            <span>{latestCommit.commit.author.name}</span>
            <span>•</span>
            <span>
              {new Date(latestCommit.commit.author.date).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}