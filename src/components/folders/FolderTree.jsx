import { useState } from 'react';
import {
  FaFolder, FaFolderOpen, FaChevronRight, FaChevronDown
} from 'react-icons/fa';

/**
 * Recursive folder tree component.
 * 
 * Props:
 *  - folders: array of all folders (flat)
 *  - selectedId: currently selected folder _id
 *  - onSelect: (folder) => void
 *  - clientName: for root folder display (fallback)
 */
export default function FolderTree({ folders, selectedId, onSelect, clientName }) {
  // Build tree structure
  const rootFolders = folders.filter(f => f.parentFolderId === null || f.parentFolderId === undefined);

  if (rootFolders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No folders yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rootFolders.map(root => (
        <TreeNode
          key={root._id}
          folder={root}
          allFolders={folders}
          selectedId={selectedId}
          onSelect={onSelect}
          level={0}
          clientName={clientName}
        />
      ))}
    </div>
  );
}

function TreeNode({ folder, allFolders, selectedId, onSelect, level, clientName }) {
  const children = allFolders.filter(f => f.parentFolderId === folder._id);
  const hasChildren = children.length > 0;
  const [expanded, setExpanded] = useState(true);

  const isSelected = selectedId === folder._id;
  const displayName = folder.isRoot && clientName ? clientName : folder.name;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition group ${
          isSelected
            ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/30'
            : 'hover:bg-white/5 text-gray-300'
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={() => onSelect(folder)}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs w-4 flex-shrink-0 text-gray-400 hover:text-cyan-400"
          >
            {expanded ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Folder icon */}
        <span className={`text-lg flex-shrink-0 ${folder.isRoot ? 'text-cyan-400' : 'text-yellow-500'}`}>
          {isSelected || expanded ? <FaFolderOpen /> : <FaFolder />}
        </span>

        {/* Name */}
        <span className="truncate text-sm font-medium flex-1" title={displayName}>
          {displayName}
        </span>
      </div>

      {/* Children (recursive) */}
      {expanded && hasChildren && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child._id}
              folder={child}
              allFolders={allFolders}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
              clientName={clientName}
            />
          ))}
        </div>
      )}
    </div>
  );
}