import { useState } from 'react';
import { GitCommit, X, Clock, User, RefreshCw } from 'lucide-react';

export default function CommitHistory({ repoFullName, onClose }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/repo/commits?repo=${repoFullName}&per_page=10`);
      if (!response.ok) throw new Error('Failed to fetch commits');
      const data = await response.json();
      setCommits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch commits when component mounts
  useState(() => {
    fetchCommits();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg w-[800px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-green-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-green-400">Recent Commits</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCommits}
              className="p-2 hover:bg-green-900/30 rounded-lg transition-colors"
              title="Refresh commits"
            >
              <RefreshCw className="w-4 h-4 text-green-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-green-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              Error loading commits: {error}
            </div>
          ) : (
            <div className="space-y-4">
              {commits.map((commit) => (
                <div
                  key={commit.sha}
                  className="border border-green-800/50 rounded-lg p-4 hover:bg-green-900/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <GitCommit className="w-5 h-5 text-green-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 font-medium break-words">
                        {commit.commit.message}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-green-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{commit.commit.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(commit.commit.author.date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}