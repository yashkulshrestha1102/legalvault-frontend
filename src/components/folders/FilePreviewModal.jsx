import { useEffect, useState } from 'react';
import { FaTimes, FaDownload, FaCopy, FaCheck, FaFileArchive, FaFolder, FaFile } from 'react-icons/fa';
import JSZip from 'jszip';
import api from '../../utils/api';

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

const isTextLike = (file) => {
  if (!file) return false;
  if (file.fileType === 'text') return true;
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.startsWith('text/')) return true;
  if (mime.includes('xml')) return true;
  if (mime.includes('json')) return true;
  const ext = (file.filename || '').toLowerCase().split('.').pop();
  const textExts = ['xml', 'json', 'txt', 'csv', 'log', 'md', 'html', 'htm', 'css', 'js', 'ts', 'env'];
  return textExts.includes(ext);
};

const isXmlFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.includes('xml')) return true;
  const ext = (file.filename || '').toLowerCase().split('.').pop();
  return ext === 'xml';
};

const isJsonFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.includes('json')) return true;
  const ext = (file.filename || '').toLowerCase().split('.').pop();
  return ext === 'json';
};

const isZipFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('rar')) return true;
  const ext = (file.filename || '').toLowerCase().split('.').pop();
  return ['zip', 'rar', '7z'].includes(ext);
};

const formatXml = (xml) => {
  try {
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\n$2$3');
    let pad = 0;
    return formatted.split('\n').map((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) indent = 0;
      else if (node.match(/^<\/\w/)) { if (pad !== 0) pad -= 1; }
      else if (node.match(/^<\w[^>]*[^/]>.*$/)) indent = 1;
      const padding = '  '.repeat(pad);
      pad += indent;
      return padding + node;
    }).join('\n');
  } catch (err) {
    return xml;
  }
};

const formatJson = (json) => {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch (err) {
    return json;
  }
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ✅ NEW: Resolve file URL (R2, GridFS, or relative)
const resolveFileUrl = (file) => {
  if (!file) return null;

  // 1. Explicit url field (R2 or GridFS URL from backend)
  if (file.url && typeof file.url === 'string' && file.url.trim() !== '') {
    return file.url;
  }

  // 2. R2 key — construct URL
  if (file.r2Key) {
    const R2_PUBLIC_URL = 'https://pub-a440a9cec38545b78be985a8675f5198.r2.dev';
    // If r2Key already has http, use as-is (rare)
    if (file.r2Key.startsWith('http')) return file.r2Key;
    return `${R2_PUBLIC_URL}/${file.r2Key}`;
  }

  // 3. GridFS fileId — relative API path
  if (file.fileId) {
    return `/api/custom-files/file/${file.fileId}`;
  }

  // 4. No URL available
  return null;
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function FilePreviewModal({ open, onClose, file }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('formatted');
  const [copied, setCopied] = useState(false);

  // ZIP-specific state
  const [zipContents, setZipContents] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipFileContent, setZipFileContent] = useState(null);

  useEffect(() => {
    if (!open || !file) {
      setBlobUrl(null);
      setTextContent(null);
      setError(null);
      setViewMode('formatted');
      setCopied(false);
      setZipContents(null);
      setZipError(null);
      setSelectedZipFile(null);
      setZipFileContent(null);
      return;
    }

    let revoked = false;
    let createdUrl = null;

    const loadFile = async () => {
      setLoading(true);
      setError(null);

      // ✅ Resolve URL with fallback logic
      const url = resolveFileUrl(file);

      if (!url) {
        if (!revoked) {
          setError('File URL not available. The file may have been deleted or is missing from storage.');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get(url, { responseType: 'blob' });

        // ZIP FILE HANDLING
        if (isZipFile(file)) {
          setZipLoading(true);
          try {
            const zip = await JSZip.loadAsync(response.data);
            const files = [];

            zip.forEach((relativePath, zipEntry) => {
              files.push({
                name: relativePath,
                isDir: zipEntry.dir,
                size: zipEntry._data?.uncompressedSize || 0,
                zipEntry,
              });
            });

            if (!revoked) {
              setZipContents({
                name: file.filename,
                files: files,
                zipInstance: zip,
              });
            }
          } catch (zipErr) {
            console.error('ZIP parse error:', zipErr);
            if (!revoked) setZipError('Failed to read ZIP file');
          } finally {
            if (!revoked) setZipLoading(false);
          }
        }
        // TEXT FILES (XML/JSON/TXT)
        else if (isTextLike(file)) {
          const text = await response.data.text();
          if (!revoked) setTextContent(text);
        }
        // BINARY (PDF/IMAGE)
        else {
          const blob = new Blob([response.data], { type: file.mimeType });
          createdUrl = window.URL.createObjectURL(blob);
          if (!revoked) setBlobUrl(createdUrl);
        }
      } catch (err) {
        console.error('Preview error:', err);
        if (!revoked) {
          if (err.response?.status === 404) {
            setError('File not found on server. It may have been deleted.');
          } else if (err.response?.status === 400) {
            setError('Invalid file reference. Please re-upload this file.');
          } else {
            setError('Failed to load preview. Try downloading the file.');
          }
        }
      } finally {
        if (!revoked) setLoading(false);
      }
    };

    loadFile();

    return () => {
      revoked = true;
      if (createdUrl) {
        setTimeout(() => window.URL.revokeObjectURL(createdUrl), 100);
      }
    };
  }, [open, file]);

  // ✅ Extract & preview a file from ZIP
  const handleZipFileClick = async (zipFile) => {
    if (zipFile.isDir) return;

    try {
      setSelectedZipFile(zipFile);
      setZipFileContent(null);

      const content = await zipFile.zipEntry.async('blob');
      const zipFileName = zipFile.name.toLowerCase();

      if (
        zipFileName.endsWith('.xml') ||
        zipFileName.endsWith('.json') ||
        zipFileName.endsWith('.txt') ||
        zipFileName.endsWith('.csv') ||
        zipFileName.endsWith('.log') ||
        zipFileName.endsWith('.md')
      ) {
        const text = await content.text();
        setZipFileContent({ type: 'text', content: text });
      }
      else if (
        zipFileName.endsWith('.jpg') ||
        zipFileName.endsWith('.jpeg') ||
        zipFileName.endsWith('.png') ||
        zipFileName.endsWith('.gif') ||
        zipFileName.endsWith('.webp')
      ) {
        const url = window.URL.createObjectURL(content);
        setZipFileContent({ type: 'image', url });
      }
      else {
        setZipFileContent({ type: 'unknown' });
      }
    } catch (err) {
      console.error('Failed to extract file from ZIP:', err);
      setZipFileContent({ type: 'error', message: err.message });
    }
  };

  // ✅ Download a file from ZIP
  const handleZipFileDownload = async (zipFile) => {
    try {
      const blob = await zipFile.zipEntry.async('blob');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFile.name.split('/').pop() || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download from ZIP failed:', err);
      alert('Failed to extract file');
    }
  };

  // ✅ FIXED: Download with null check
  const handleDownload = async () => {
    if (!file) return;

    const url = resolveFileUrl(file);

    if (!url) {
      alert('File URL not available. Cannot download.');
      return;
    }

    try {
      const response = await api.get(url, {
        responseType: 'blob',
        params: { download: 1 }
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      if (err.response?.status === 404) {
        alert('File not found. It may have been deleted.');
      } else {
        alert('Failed to download file. Please try again.');
      }
    }
  };

  const handleCopy = async () => {
    if (!textContent) return;
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!open || !file) return null;

  const isXml = isXmlFile(file);
  const isJson = isJsonFile(file);
  const isFormattable = isXml || isJson;
  const isZip = isZipFile(file);

  const displayedContent = textContent
    ? viewMode === 'formatted'
      ? isXml
        ? formatXml(textContent)
        : isJson
        ? formatJson(textContent)
        : textContent
      : textContent
    : null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass w-full max-w-6xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {isZip && <FaFileArchive className="text-yellow-400 text-2xl flex-shrink-0" />}
            <div className="min-w-0">
              <h3 className="text-lg font-bold truncate">{file.filename}</h3>
              <p className="text-xs text-gray-400">
                {file.fileType?.toUpperCase()} • {file.mimeType} •{' '}
                {file.fileSize ? formatSize(file.fileSize) : ''}
                {isZip && zipContents && ` • ${zipContents.files.length} files inside`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isFormattable && textContent && (
              <>
                <div className="flex glass-card rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-3 py-2 text-xs transition ${
                      viewMode === 'formatted'
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🌳 Formatted
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-2 text-xs transition ${
                      viewMode === 'raw'
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📄 Raw
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className={`glass-card px-3 py-2 text-xs transition flex items-center gap-1 ${
                    copied ? 'text-green-400' : 'text-yellow-400 hover:scale-105'
                  }`}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="glass-card px-3 py-2 text-green-400 hover:scale-105 transition text-sm flex items-center gap-2"
            >
              <FaDownload /> Download
            </button>

            <button
              onClick={onClose}
              className="glass-card px-3 py-2 hover:scale-105 transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden bg-black/40">
          {/* ZIP VIEW */}
          {isZip ? (
            <div className="flex h-full">
              {/* ZIP file list */}
              <div className="w-1/2 border-r border-white/10 overflow-y-auto p-4">
                {zipLoading ? (
                  <div className="text-gray-400 text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
                    Reading ZIP...
                  </div>
                ) : zipError ? (
                  <div className="text-red-400 text-center py-10">
                    ❌ {zipError}
                    <button
                      onClick={handleDownload}
                      className="glass-card px-4 py-2 mt-4 text-green-400 block mx-auto"
                    >
                      Download ZIP
                    </button>
                  </div>
                ) : zipContents ? (
                  <>
                    <p className="text-xs uppercase text-gray-400 tracking-wider mb-3">
                      📁 ZIP Contents ({zipContents.files.length})
                    </p>
                    <div className="space-y-1">
                      {zipContents.files.map((f, i) => (
                        <div
                          key={i}
                          onClick={() => handleZipFileClick(f)}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                            selectedZipFile?.name === f.name
                              ? 'bg-cyan-500/20 text-cyan-100'
                              : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          {f.isDir ? (
                            <FaFolder className="text-yellow-500 flex-shrink-0" />
                          ) : (
                            <FaFile className="text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm truncate flex-1" title={f.name}>
                            {f.name}
                          </span>
                          {!f.isDir && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleZipFileDownload(f);
                              }}
                              className="text-green-400 hover:text-green-300 text-xs opacity-60 hover:opacity-100"
                              title="Extract this file"
                            >
                              <FaDownload size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-10">No contents loaded</p>
                )}
              </div>

              {/* File preview area */}
              <div className="w-1/2 overflow-auto p-4">
                {!selectedZipFile ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FaFileArchive className="text-5xl text-yellow-400/30 mb-4" />
                    <p className="text-sm">Click a file from the ZIP to preview</p>
                    <p className="text-xs text-gray-500 mt-2">XML, JSON, TXT, images supported</p>
                  </div>
                ) : !zipFileContent ? (
                  <div className="text-gray-400 text-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto"></div>
                  </div>
                ) : zipFileContent.type === 'text' ? (
                  <div className="h-full">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                      <p className="text-xs text-cyan-400 truncate">{selectedZipFile.name}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(zipFileContent.content);
                          alert('✅ Copied!');
                        }}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-cyan-100 whitespace-pre-wrap">
                      {selectedZipFile.name.toLowerCase().endsWith('.xml')
                        ? formatXml(zipFileContent.content)
                        : selectedZipFile.name.toLowerCase().endsWith('.json')
                        ? formatJson(zipFileContent.content)
                        : zipFileContent.content}
                    </pre>
                  </div>
                ) : zipFileContent.type === 'image' ? (
                  <img
                    src={zipFileContent.url}
                    alt={selectedZipFile.name}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                ) : zipFileContent.type === 'error' ? (
                  <div className="text-red-400 text-center py-10">
                    ❌ {zipFileContent.message}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FaFile className="text-4xl text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Preview not available</p>
                    <button
                      onClick={() => handleZipFileDownload(selectedZipFile)}
                      className="glass-card px-4 py-2 text-green-400 text-sm"
                    >
                      <FaDownload className="inline mr-2" /> Extract file
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // NON-ZIP FILES
            <div className="flex-1 overflow-auto flex items-center justify-center h-full">
              {loading ? (
                <div className="text-gray-400 py-20 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                  <p>Loading preview...</p>
                </div>
              ) : error ? (
                <div className="text-red-400 py-20 text-center max-w-md px-4">
                  <p className="text-lg mb-2">❌ {error}</p>
                  <button
                    onClick={handleDownload}
                    className="glass-card px-6 py-3 mt-4 text-green-400 hover:scale-105 transition"
                  >
                    <FaDownload className="inline mr-2" /> Try Download
                  </button>
                  <button
                    onClick={onClose}
                    className="glass-card px-6 py-3 mt-4 ml-2 text-gray-300 hover:scale-105 transition"
                  >
                    Close
                  </button>
                </div>
              ) : file.fileType === 'image' && blobUrl ? (
                <img
                  src={blobUrl}
                  alt={file.filename}
                  className="max-w-full max-h-full object-contain"
                />
              ) : file.fileType === 'pdf' && blobUrl ? (
                <iframe
                  src={blobUrl}
                  title={file.filename}
                  className="w-full h-[75vh] bg-white"
                />
              ) : textContent !== null ? (
                <div className="w-full h-full overflow-auto">
                  <pre
                    className={`text-xs font-mono whitespace-pre-wrap p-6 ${
                      isXml || isJson ? 'text-cyan-100' : 'text-white text-sm'
                    }`}
                  >
                    {displayedContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📎</div>
                  <p className="text-gray-400 mb-2">
                    Preview not available for this file type
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {file.filename} • {file.mimeType}
                  </p>
                  <button
                    onClick={handleDownload}
                    className="glass-card px-6 py-3 text-green-400 hover:scale-105 transition"
                  >
                    <FaDownload className="inline mr-2" /> Download to view
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {textContent && (isXml || isJson) && (
          <div className="px-4 py-2 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs text-gray-400">
            <span>
              {isXml ? '📄 XML Document' : '📄 JSON Document'} •{' '}
              {textContent.length.toLocaleString()} characters
            </span>
            <span className="text-cyan-400/70">
              View: {viewMode === 'formatted' ? 'Formatted' : 'Raw'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}