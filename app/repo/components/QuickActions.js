import { Copy, FileDown, Files, FileInput } from "lucide-react";

const CardButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-black border border-green-800 rounded-lg p-2 flex flex-col items-center justify-center gap-1 hover:border-green-400 transition-colors duration-200"
  >
    <Icon className="w-4 h-4 text-green-500" />
    <span className="text-xs font-medium text-green-400">{label}</span>
  </button>
);

export default function QuickActions({ onCopyTree, onCreateMd, onSelectFiles, onMdToFiles }) {
  const actions = [
    { icon: Copy, label: "Copy Tree", handler: onCopyTree },
    { icon: FileDown, label: "Create MD", handler: onCreateMd },
    { icon: Files, label: "Select Files", handler: onSelectFiles },
    { icon: FileInput, label: "MD to Files", handler: onMdToFiles }
  ];

  return (
    <div className="bg-black border border-green-800 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-green-400 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-2">
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
  );
}