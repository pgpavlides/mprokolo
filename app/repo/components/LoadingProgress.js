// app/repo/components/LoadingProgress.js

export default function LoadingProgress({ 
    current, 
    total, 
    currentFileName,
    isComplete 
  }) {
    const progress = Math.round((current / total) * 100);
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-black border border-green-800 rounded-lg p-6 w-96 flex flex-col items-center">
          <div className="w-full mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-green-400">Generating Documentation</span>
              <span className="text-green-400">{progress}%</span>
            </div>
            <div className="w-full bg-green-900/30 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
  
          <div className="text-center mb-4">
            <p className="text-green-400 text-sm">
              Processing: {currentFileName || 'Initializing...'}
            </p>
            <p className="text-green-600 text-sm">
              {current} of {total} files
            </p>
          </div>
  
          {isComplete && (
            <div className="text-green-400 mt-2">
              <p>✓ Documentation generated successfully!</p>
            </div>
          )}
        </div>
      </div>
    );
  }