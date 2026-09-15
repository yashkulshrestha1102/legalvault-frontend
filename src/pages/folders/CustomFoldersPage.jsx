import { useState, useEffect, useCallback } from 'react';
import {
  FaFolderPlus, FaUpload, FaFileDownload, FaTrash, FaEdit,
  FaSearch, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFileAlt,
  FaFolder, FaEye, FaFileArchive, FaFileCode
} from 'react-icons/fa';
import api from '../../utils/api';
import FolderTree from '../../components/folders/FolderTree';
import CreateFolderModal from '../../components/folders/CreateFolderModal';
import BulkUploadModal from '../../components/folders/BulkUploadModal';
import FilePreviewModal from '../../components/folders/FilePreviewModal';
import RenameModal from '../../components/folders/RenameModal';

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

// ✅ Updated: XML/JSON/ZIP icons
const getFileIcon = (type, mimeType, filename) => {
  const mime = (mimeType || '').toLowerCase();
  const ext = (filename || '').toLowerCase().split('.').pop();

  // ✅ XML / JSON — code icon
  if (mime.includes('xml') || mime.includes('json') || ['xml', 'json'].includes(ext)) {
    return <FaFileCode className="text-purple-400 text-4xl" />;
  }

  // ✅ ZIP / Archive
  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('rar') ||
    ['zip', 'rar', '7z'].includes(ext)
  ) {
    return <FaFileArchive className="text-yellow-400 text-4xl" />;
  }

  switch (type) {
    case 'pdf': return <FaFilePdf className="text-red-400 text-4xl" />;
    case 'image': return <FaFileImage className="text-cyan-400 text-4xl" />;
    case 'word': return <FaFileWord className="text-blue-400 text-4xl" />;
    case 'excel': return <FaFileExcel className="text-green-400 text-4xl" />;
    case 'text': return <FaFileAlt className="text-yellow-400 text-4xl" />;
    default: return <FaFileAlt className="text-gray-400 text-4xl" />;
  }
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function CustomFoldersPage({ clientId, clientName }) {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [renamingItem, setRenamingItem] = useState(null);

  // ✅ Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/custom-folders/client/${clientId}`);
      setFolders(res.data);
      const root = res.data.find(f => f.isRoot);
      if (root && !selectedFolder) {
        setSelectedFolder(root);
      } else if (selectedFolder) {
        const refreshed = res.data.find(f => f._id === selectedFolder._id);
        if (refreshed) setSelectedFolder(refreshed);
      }
    } catch (err) {
      console.error('❌ Folders fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId, selectedFolder?._id]);

  useEffect(() => {
    if (clientId) fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // ✅ Fetch files of selected folder
  const fetchFiles = useCallback(async () => {
    if (!selectedFolder?._id) return;
    try {
      setFilesLoading(true);
      const res = await api.get(`/api/custom-files/folder/${selectedFolder._id}`);
      setFiles(res.data);
    } catch (err) {
      console.error('❌ Files fetch error:', err);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [selectedFolder?._id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ✅ Create folder
  const handleCreateFolder = async (name) => {
    const parentId = selectedFolder?._id || null;
    await api.post('/api/custom-folders', {
      name,
      clientId,
      parentFolderId: parentId
    });
    await fetchFolders();
  };

  // ✅ Rename folder
  const handleRenameFolder = async (folderId, newName) => {
    await api.put(`/api/custom-folders/${folderId}/rename`, { name: newName });
    await fetchFolders();
  };

  // ✅ Delete folder
  const handleDeleteFolder = async (folder) => {
    if (folder.isRoot) {
      alert('Root folder cannot be deleted');
      return;
    }
    if (!window.confirm(`Delete folder "${folder.name}"?\nAll files and subfolders inside will be deleted.`)) return;

    try {
      await api.delete(`/api/custom-folders/${folder._id}`);
      if (selectedFolder?._id === folder._id) {
        const root = folders.find(f => f.isRoot);
        if (root) setSelectedFolder(root);
      }
      await fetchFolders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete folder');
    }
  };

  // ✅ Rename file
  const handleRenameFile = async (fileId, newName) => {
    await api.put(`/api/custom-files/${fileId}/rename`, { newName });
    await fetchFiles();
  };

  // ✅ Delete file
  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.filename}"?`)) return;
    try {
      await api.delete(`/api/custom-files/${file._id}`);
      await fetchFiles();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  // ═══════════════════════════════════════════
  // ZIP DOWNLOAD — Fixed with 10 min timeout + progress
  // ═══════════════════════════════════════════
  const handleDownloadZip = async () => {
    if (!selectedFolder) return;
    if (zipDownloading) return;

    try {
      setZipDownloading(true);
      setZipProgress(0);

      const res = await api.get(
        `/api/custom-files/download-folder/${selectedFolder._id}`,
        {
          responseType: 'blob',
          timeout: 600000, // ✅ 10 minutes
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setZipProgress(percent);
            } else {
              // Total not available — show loading
              const mbLoaded = (progressEvent.loaded / 1024 / 1024).toFixed(1);
              setZipProgress(`~${mbLoaded} MB downloaded`);
            }
          },
        }
      );

      // ✅ Create download
      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedFolder.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ✅ Cleanup after 60s
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);

      setZipProgress(100);
      setTimeout(() => setZipProgress(0), 1500);
    } catch (err) {
      console.error('❌ ZIP download error:', err);

      let errorMsg = 'Failed to download ZIP';
      if (err.code === 'ECONNABORTED') {
        errorMsg = '❌ Timeout: ZIP is too large. Try downloading subfolders separately.';
      } else if (err.response?.status === 404) {
        errorMsg = '❌ Folder not found';
      } else if (err.response?.status === 403) {
        errorMsg = '❌ Access denied';
      } else if (err.response?.status === 500) {
        errorMsg = '❌ Server error during ZIP creation';
      } else if (err.message) {
        errorMsg = `❌ ${err.message}`;
      }

      alert(errorMsg);
      setZipProgress(0);
    } finally {
      setZipDownloading(false);
    }
  };

  // ✅ Search
  const handleSearch = async (q) => {
    setSearchTerm(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.get(`/api/custom-files/search/${clientId}`, {
        params: { q: q.trim() }
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const displayFolders = searchResults
    ? searchResults.folders.filter(f => !f.isRoot)
    : folders.filter(f => f.parentFolderId === selectedFolder?._id && !f.isRoot);

  const displayFiles = searchResults ? searchResults.files : files;

  return (
    <div className="glass p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <div className="flex items-center gap-3">
          <FaFolder className="text-cyan-400 text-2xl" />
          <div>
            <h2 className="text-2xl font-bold">{clientName || 'Client'} — Files</h2>
            <p className="text-xs text-gray-400">Custom folder storage</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="glass-card flex items-center gap-2 px-3 py-2 min-w-[200px]">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search files & folders..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-white"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!selectedFolder}
            className="glass-card px-4 py-2 text-sm hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FaFolderPlus /> New Folder
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedFolder}
            className="glass-card px-4 py-2 blue-glow text-sm hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FaUpload /> Upload
          </button>

          {selectedFolder && (
            <button
              onClick={handleDownloadZip}
              disabled={zipDownloading}
              className={`glass-card px-4 py-2 text-green-400 text-sm transition flex items-center gap-2 ${
                zipDownloading ? 'opacity-75 cursor-wait' : 'hover:scale-105'
              }`}
              title="Download folder as ZIP"
            >
              <FaFileDownload />
              {zipDownloading
                ? `ZIP ${typeof zipProgress === 'number' ? zipProgress + '%' : zipProgress}`
                : 'ZIP'}
            </button>
          )}
        </div>
      </div>

      {/* ZIP download progress bar */}
      {zipDownloading && (
        <div className="mb-4 glass-card p-3">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>📦 Preparing ZIP...</span>
            <span>{typeof zipProgress === 'number' ? `${zipProgress}%` : zipProgress}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-green-500 transition-all"
              style={{ width: typeof zipProgress === 'number' ? `${zipProgress}%` : '100%' }}
            />
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar — Tree */}
        <div className="lg:col-span-1 glass-card p-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs uppercase text-gray-400 tracking-wider mb-3 px-2">
            📁 Folders
          </p>
          {loading ? (
            <p className="text-gray-400 text-sm p-2">Loading...</p>
          ) : (
            <FolderTree
              folders={folders}
              selectedId={selectedFolder?._id}
              onSelect={(f) => {
                setSelectedFolder(f);
                setSearchResults(null);
                setSearchTerm('');
              }}
              clientName={clientName}
            />
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Breadcrumb / Current folder */}
          {selectedFolder && !searchResults && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-400">📂</span>
              <span className="text-sm font-medium text-white">
                {selectedFolder.isRoot ? clientName : selectedFolder.name}
              </span>
              {!selectedFolder.isRoot && (
                <>
                  <button
                    onClick={() => setRenamingItem({ type: 'folder', item: selectedFolder })}
                    className="text-yellow-400 hover:scale-110 text-xs"
                    title="Rename folder"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(selectedFolder)}
                    className="text-red-400 hover:scale-110 text-xs"
                    title="Delete folder"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          )}

          {searchResults && (
            <div className="mb-4 text-sm text-gray-400">
              🔍 Found <span className="text-cyan-400">{displayFolders.length}</span> folders
              and <span className="text-cyan-400">{displayFiles.length}</span> files
              <button
                onClick={() => { setSearchTerm(''); setSearchResults(null); }}
                className="ml-3 text-xs text-red-400 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Subfolders grid */}
          {displayFolders.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase text-gray-400 tracking-wider mb-2">
                Subfolders ({displayFolders.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayFolders.map(f => (
                  <div
                    key={f._id}
                    onClick={() => {
                      setSelectedFolder(f);
                      setSearchResults(null);
                      setSearchTerm('');
                    }}
                    className="glass-card p-3 cursor-pointer hover:scale-105 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <FaFolder className="text-yellow-500 text-2xl flex-shrink-0" />
                      <p className="text-sm font-medium truncate flex-1" title={f.name}>
                        {f.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files grid */}
          <div>
            <p className="text-xs uppercase text-gray-400 tracking-wider mb-2">
              Files ({displayFiles.length})
            </p>

            {filesLoading ? (
              <p className="text-gray-400 text-sm py-8 text-center">Loading files...</p>
            ) : displayFiles.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p>{searchResults ? 'No matching files' : 'No files in this folder'}</p>
                {!searchResults && selectedFolder && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="glass-card px-4 py-2 mt-4 blue-glow text-sm hover:scale-105 transition"
                  >
                    Upload first file
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayFiles.map(file => (
                  <div
                    key={file._id}
                    className="glass-card p-3 hover:scale-[1.03] transition group"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => setPreviewFile(file)}
                    >
                      <div className="flex justify-center py-3">
                        {getFileIcon(file.fileType, file.mimeType, file.filename)}
                      </div>
                      <p
                        className="text-sm font-medium text-center truncate"
                        title={file.filename}
                      >
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        {formatSize(file.fileSize)}
                      </p>
                    </div>

                    <div className="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="text-cyan-400 hover:scale-110 p-1"
                        title="Preview"
                      >
                        <FaEye size={12} />
                      </button>
                      <button
                        onClick={() => setRenamingItem({ type: 'file', item: file })}
                        className="text-yellow-400 hover:scale-110 p-1"
                        title="Rename"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file)}
                        className="text-red-400 hover:scale-110 p-1"
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFolder}
        parentName={selectedFolder?.isRoot ? clientName : selectedFolder?.name}
      />

      <BulkUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        folderId={selectedFolder?._id}
        clientId={clientId}
        folderName={selectedFolder?.isRoot ? clientName : selectedFolder?.name}
        onUploaded={(data) => {
          fetchFiles();
          fetchFolders();
          alert(`✅ ${data.files?.length || 0} file(s) uploaded!`);
        }}
      />

      <FilePreviewModal
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      <RenameModal
        open={!!renamingItem}
        onClose={() => setRenamingItem(null)}
        currentName={renamingItem?.item?.name || renamingItem?.item?.filename}
        type={renamingItem?.type}
        onRename={async (newName) => {
          if (renamingItem.type === 'folder') {
            await handleRenameFolder(renamingItem.item._id, newName);
          } else {
            await handleRenameFile(renamingItem.item._id, newName);
          }
        }}
      />
    </div>
  );
}