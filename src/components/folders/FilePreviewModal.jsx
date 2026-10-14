import { useEffect, useState, useRef } from 'react';
import {
  FaTimes, FaDownload, FaCopy, FaCheck, FaFileArchive, FaFolder, FaFile,
  FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCode, FaFileAlt
} from 'react-icons/fa';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import api from '../../utils/api';

// ═══════════════════════════════════════════
// HELPERS — File type detection (FIXED)
// ═══════════════════════════════════════════

const getExt = (filename) => (filename || '').toLowerCase().split('.').pop() || '';

// ✅ FIXED: Word/Excel/PPT files को TEXT न समझो
const isTextLike = (file) => {
  if (!file) return false;
  const ext = getExt(file.filename);
  const mime = (file.mimeType || '').toLowerCase();

  // ✅ fileType from backend (most reliable)
  if (file.fileType === 'text') return true;
  if (file.fileType === 'xml' || file.fileType === 'json') return true;

  // ❌ Office files NEVER text
  if (['word', 'excel', 'pptx', 'pdf', 'image'].includes(file.fileType)) return false;
  if (mime.includes('wordprocessingml')) return false;
  if (mime.includes('spreadsheetml')) return false;
  if (mime.includes('presentationml')) return false;
  if (mime.includes('officedocument')) return false;

  // ✅ Text MIME
  if (mime.startsWith('text/')) return true;
  if (mime === 'application/json') return true;
  if (mime === 'application/xml' || mime === 'text/xml' || mime === 'application/x-xml') return true;

  // ✅ Extensions
  const textExts = ['txt', 'csv', 'log', 'md', 'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'sql', 'env', 'yaml', 'yml'];
  return textExts.includes(ext);
};

const isXmlFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.includes('wordprocessingml') || mime.includes('officedocument')) return false;
  if (mime === 'application/xml' || mime === 'text/xml' || mime === 'application/x-xml') return true;
  return getExt(file.filename) === 'xml';
};

const isJsonFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  if (mime.includes('officedocument')) return false;
  if (mime === 'application/json') return true;
  return getExt(file.filename) === 'json';
};

const isWordFile = (file) => {
  if (!file) return false;
  const ext = getExt(file.filename);
  const mime = (file.mimeType || '').toLowerCase();
  return (
    file.fileType === 'word' ||
    mime.includes('word') ||
    mime.includes('wordprocessingml') ||
    ['doc', 'docx'].includes(ext)
  );
};

const isExcelFile = (file) => {
  if (!file) return false;
  const ext = getExt(file.filename);
  const mime = (file.mimeType || '').toLowerCase();
  return (
    file.fileType === 'excel' ||
    mime.includes('excel') ||
    mime.includes('spreadsheet') ||
    ['xls', 'xlsx'].includes(ext)
  );
};

const isPptFile = (file) => {
  if (!file) return false;
  const ext = getExt(file.filename);
  const mime = (file.mimeType || '').toLowerCase();
  return (
    file.fileType === 'pptx' ||
    file.fileType === 'ppt' ||
    mime.includes('powerpoint') ||
    mime.includes('presentationml') ||
    ['ppt', 'pptx'].includes(ext)
  );
};

const isZipFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  const ext = getExt(file.filename);
  return (
    file.fileType === 'zip' ||
    mime.includes('zip') ||
    mime.includes('compressed') ||
    ['zip'].includes(ext)
  );
};

const isCsvFile = (file) => {
  if (!file) return false;
  const mime = (file.mimeType || '').toLowerCase();
  return mime === 'text/csv' || getExt(file.filename) === 'csv';
};

// ═══════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════

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

const resolveFileUrl = (file) => {
  if (!file) return null;
  if (file.url && typeof file.url === 'string' && file.url.trim() !== '') return file.url;
  if (file.r2Key) {
    const R2_PUBLIC_URL = 'https://pub-a440a9cec38545b78be985a8675f5198.r2.dev';
    if (file.r2Key.startsWith('http')) return file.r2Key;
    return `${R2_PUBLIC_URL}/${file.r2Key}`;
  }
  if (file.fileId) return `/api/custom-files/file/${file.fileId}`;
  return null;
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function FilePreviewModal({ open, onClose, file }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [blob, setBlob] = useState(null);         // NEW: raw blob for word/excel processing
  const [textContent, setTextContent] = useState(null);
  const [wordHtml, setWordHtml] = useState(null); // NEW: Word → HTML
  const [excelData, setExcelData] = useState(null); // NEW: Excel sheet data
  const [activeSheet, setActiveSheet] = useState(0); // NEW: active sheet index
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('formatted');
  const [copied, setCopied] = useState(false);

  // ZIP state
  const [zipContents, setZipContents] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipFileContent, setZipFileContent] = useState(null);

  const wordContainerRef = useRef(null);

  // ═══════════════════════════════════════════
  // RESET ON OPEN/CLOSE
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (!open || !file) {
      setBlobUrl(null);
      setBlob(null);
      setTextContent(null);
      setWordHtml(null);
      setExcelData(null);
      setActiveSheet(0);
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

      const url = resolveFileUrl(file);
      if (!url) {
        if (!revoked) {
          setError('File URL not available. The file may have been deleted.');
          setLoading(false);
        }
        return;
      }

      try {
        // ✅ Get the blob
        const response = await api.get(url, { responseType: 'blob' });
        const rawBlob = response.data;
        if (!revoked) setBlob(rawBlob);

        // ═══════════════════════════════════════════
        // 1. ZIP FILE
        // ═══════════════════════════════════════════
        if (isZipFile(file)) {
          setZipLoading(true);
          try {
            const zip = await JSZip.loadAsync(rawBlob);
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
              setZipContents({ name: file.filename, files, zipInstance: zip });
            }
          } catch (zipErr) {
            console.error('ZIP parse error:', zipErr);
            if (!revoked) setZipError('Failed to read ZIP file');
          } finally {
            if (!revoked) setZipLoading(false);
          }
          return;
        }

        // ═══════════════════════════════════════════
        // 2. WORD FILE — mammoth.js → HTML
        // ═══════════════════════════════════════════
        if (isWordFile(file)) {
          try {
            const arrayBuffer = await rawBlob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            if (!revoked) setWordHtml(result.value || '<p>Empty document</p>');
          } catch (wordErr) {
            console.error('Word preview error:', wordErr);
            if (!revoked) setError('Failed to parse Word document. Try downloading.');
          }
          return;
        }

        // ═══════════════════════════════════════════
        // 3. EXCEL FILE — xlsx → table
        // ═══════════════════════════════════════════
        if (isExcelFile(file)) {
          try {
            const arrayBuffer = await rawBlob.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
            if (!revoked) setExcelData(workbook);
          } catch (xlsErr) {
            console.error('Excel preview error:', xlsErr);
            if (!revoked) setError('Failed to parse Excel file. Try downloading.');
          }
          return;
        }

        // ═══════════════════════════════════════════
        // 4. POWERPOINT — Not directly supported
        // ═══════════════════════════════════════════
        if (isPptFile(file)) {
          // Keep blob — user can download
          const url = window.URL.createObjectURL(rawBlob);
          createdUrl = url;
          if (!revoked) setBlobUrl(url);
          return;
        }

        // ═══════════════════════════════════════════
        // 5. TEXT FILES (XML / JSON / TXT / CSV / Code)
        // ═══════════════════════════════════════════
        if (isTextLike(file)) {
          const text = await rawBlob.text();
          if (!revoked) setTextContent(text);
          return;
        }

        // ═══════════════════════════════════════════
        // 6. BINARY (PDF / Image)
        // ═══════════════════════════════════════════
        const blobObj = new Blob([rawBlob], { type: file.mimeType });
        createdUrl = window.URL.createObjectURL(blobObj);
        if (!revoked) setBlobUrl(createdUrl);
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
      if (createdUrl) setTimeout(() => window.URL.revokeObjectURL(createdUrl), 100);
    };
  }, [open, file]);

  // ═══════════════════════════════════════════
  // ZIP File Click Handler
  // ═══════════════════════════════════════════
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
      } else if (
        zipFileName.endsWith('.jpg') ||
        zipFileName.endsWith('.jpeg') ||
        zipFileName.endsWith('.png') ||
        zipFileName.endsWith('.gif') ||
        zipFileName.endsWith('.webp')
      ) {
        const url = window.URL.createObjectURL(content);
        setZipFileContent({ type: 'image', url });
      } else {
        setZipFileContent({ type: 'unknown' });
      }
    } catch (err) {
      console.error('Failed to extract file from ZIP:', err);
      setZipFileContent({ type: 'error', message: err.message });
    }
  };

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

  // ═══════════════════════════════════════════
  // Download Handler
  // ═══════════════════════════════════════════
  const handleDownload = async () => {
    if (!file) return;
    const url = resolveFileUrl(file);
    if (!url) {
      alert('File URL not available. Cannot download.');
      return;
    }
    try {
      const response = await api.get(url, { responseType: 'blob', params: { download: 1 } });
      const blobObj = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blobObj);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert(err.response?.status === 404
        ? 'File not found. It may have been deleted.'
        : 'Failed to download file. Please try again.');
    }
  };

  // ═══════════════════════════════════════════
  // Copy Handler
  // ═══════════════════════════════════════════
  const handleCopy = async () => {
    const content =
      textContent ||
      (wordHtml ? wordHtml.replace(/<[^>]+>/g, '') : null);
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  if (!open || !file) return null;

  const isXml = isXmlFile(file);
  const isJson = isJsonFile(file);
  const isFormattable = isXml || isJson;
  const isZip = isZipFile(file);
  const isWord = isWordFile(file);
  const isExcel = isExcelFile(file);
  const isPpt = isPptFile(file);
  const isCsv = isCsvFile(file);

  const displayedContent = textContent
    ? viewMode === 'formatted'
      ? isXml ? formatXml(textContent) : isJson ? formatJson(textContent) : textContent
      : textContent
    : null;

  // ✅ File Icon in header
  const FileIcon = () => {
    if (isZip) return <FaFileArchive className="text-yellow-400 text-2xl flex-shrink-0" />;
    if (isWord) return <FaFileWord className="text-blue-400 text-2xl flex-shrink-0" />;
    if (isExcel) return <FaFileExcel className="text-green-400 text-2xl flex-shrink-0" />;
    if (isPpt) return <FaFilePowerpoint className="text-orange-400 text-2xl flex-shrink-0" />;
    if (file.fileType === 'pdf') return <FaFilePdf className="text-red-400 text-2xl flex-shrink-0" />;
    if (file.fileType === 'image') return <FaFileImage className="text-cyan-400 text-2xl flex-shrink-0" />;
    if (isXml || isJson) return <FaFileCode className="text-purple-400 text-2xl flex-shrink-0" />;
    return <FaFileAlt className="text-gray-400 text-2xl flex-shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass w-full max-w-6xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col">

        {/* ═══════════════════════════════════════════
            HEADER
            ═══════════════════════════════════════════ */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <FileIcon />
            <div className="min-w-0">
              <h3 className="text-lg font-bold truncate">{file.filename}</h3>
              <p className="text-xs text-gray-400 truncate">
                {file.fileType?.toUpperCase()} • {formatSize(file.fileSize)}
                {isZip && zipContents && ` • ${zipContents.files.length} files inside`}
                {isExcel && excelData && ` • ${excelData.SheetNames.length} sheets`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Format toggle for XML/JSON */}
            {isFormattable && textContent && (
              <>
                <div className="flex glass-card rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-3 py-2 text-xs transition ${viewMode === 'formatted' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                  >
                    🌳 Formatted
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-2 text-xs transition ${viewMode === 'raw' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                  >
                    📄 Raw
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className={`glass-card px-3 py-2 text-xs transition flex items-center gap-1 ${copied ? 'text-green-400' : 'text-yellow-400 hover:scale-105'}`}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </>
            )}

            {/* Copy for Word */}
            {isWord && wordHtml && (
              <button
                onClick={handleCopy}
                className={`glass-card px-3 py-2 text-xs transition flex items-center gap-1 ${copied ? 'text-green-400' : 'text-yellow-400 hover:scale-105'}`}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
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

        {/* ═══════════════════════════════════════════
            BODY
            ═══════════════════════════════════════════ */}
        <div className="flex-1 overflow-hidden bg-black/40">
          {isZip ? (
            /* ZIP VIEW */
            <div className="flex h-full">
              <div className="w-1/2 border-r border-white/10 overflow-y-auto p-4">
                {zipLoading ? (
                  <div className="text-gray-400 text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
                    Reading ZIP...
                  </div>
                ) : zipError ? (
                  <div className="text-red-400 text-center py-10">
                    ❌ {zipError}
                    <button onClick={handleDownload} className="glass-card px-4 py-2 mt-4 text-green-400 block mx-auto">
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
                            selectedZipFile?.name === f.name ? 'bg-cyan-500/20 text-cyan-100' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          {f.isDir ? <FaFolder className="text-yellow-500 flex-shrink-0" /> : <FaFile className="text-gray-400 flex-shrink-0" />}
                          <span className="text-sm truncate flex-1" title={f.name}>{f.name}</span>
                          {!f.isDir && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleZipFileDownload(f); }}
                              className="text-green-400 hover:text-green-300 text-xs opacity-60 hover:opacity-100"
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
                  <img src={zipFileContent.url} alt={selectedZipFile.name} className="max-w-full max-h-full object-contain mx-auto" />
                ) : zipFileContent.type === 'error' ? (
                  <div className="text-red-400 text-center py-10">❌ {zipFileContent.message}</div>
                ) : (
                  <div className="text-center py-10">
                    <FaFile className="text-4xl text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Preview not available</p>
                    <button onClick={() => handleZipFileDownload(selectedZipFile)} className="glass-card px-4 py-2 text-green-400 text-sm">
                      <FaDownload className="inline mr-2" /> Extract file
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* NON-ZIP VIEW */
            <div className="flex-1 overflow-auto flex items-center justify-center h-full">

              {loading ? (
                <div className="text-gray-400 py-20 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                  <p>Loading preview...</p>
                </div>
              ) : error ? (
                <div className="text-red-400 py-20 text-center max-w-md px-4">
                  <p className="text-lg mb-2">❌ {error}</p>
                  <button onClick={handleDownload} className="glass-card px-6 py-3 mt-4 text-green-400 hover:scale-105 transition">
                    <FaDownload className="inline mr-2" /> Download File
                  </button>
                </div>
              ) : file.fileType === 'image' && blobUrl ? (
                /* IMAGE */
                <img src={blobUrl} alt={file.filename} className="max-w-full max-h-full object-contain" />
              ) : file.fileType === 'pdf' && blobUrl ? (
                /* PDF */
                <iframe src={blobUrl} title={file.filename} className="w-full h-[75vh] bg-white" />
              ) : isWord && wordHtml ? (
                /* WORD — mammoth HTML */
                <div className="w-full h-full overflow-auto p-8 bg-white">
                  <div
                    className="max-w-4xl mx-auto prose prose-slate"
                    dangerouslySetInnerHTML={{ __html: wordHtml }}
                  />
                </div>
              ) : isExcel && excelData ? (
                /* EXCEL — table with sheet tabs */
                <div className="w-full h-full flex flex-col">
                  {/* Sheet Tabs */}
                  {excelData.SheetNames.length > 1 && (
                    <div className="flex gap-2 p-3 border-b border-white/10 overflow-x-auto">
                      {excelData.SheetNames.map((name, i) => (
                        <button
                          key={name}
                          onClick={() => setActiveSheet(i)}
                          className={`px-4 py-2 text-sm rounded transition whitespace-nowrap ${
                            activeSheet === i
                              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                              : 'glass-card text-gray-400 hover:text-white'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sheet Table */}
                  <div className="flex-1 overflow-auto p-4">
                    <table className="min-w-full text-sm">
                      <tbody>
                        {XLSX.utils
                          .sheet_to_json(excelData.Sheets[excelData.SheetNames[activeSheet]], {
                            header: 1,
                            defval: '',
                          })
                          .map((row, i) => (
                            <tr key={i} className={i === 0 ? 'bg-cyan-500/10 font-semibold' : 'border-b border-white/5'}>
                              <td className="px-3 py-2 text-gray-500 text-xs border-r border-white/10">{i + 1}</td>
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2 text-gray-100 border-r border-white/5 whitespace-nowrap">
                                  {String(cell ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : isPpt && blobUrl ? (
                /* POWERPOINT — Download prompt + Google Viewer */
                <div className="text-center py-20 max-w-md px-4">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg font-semibold text-white mb-2">PowerPoint Presentation</p>
                  <p className="text-gray-400 text-sm mb-6">{file.filename}</p>
                  <p className="text-gray-500 text-xs mb-6">
                    In-browser preview not available. Download or open in Google Viewer.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button onClick={handleDownload} className="glass-card px-6 py-3 text-green-400 hover:scale-105 transition flex items-center gap-2">
                      <FaDownload /> Download
                    </button>
                    {file.url && (
                      <a
                        href={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card px-6 py-3 text-cyan-400 hover:scale-105 transition"
                      >
                        Open in Google Viewer
                      </a>
                    )}
                  </div>
                </div>
              ) : textContent !== null ? (
                /* TEXT / CODE / CSV / XML / JSON */
                <div className="w-full h-full overflow-auto">
                  <pre className={`text-xs font-mono whitespace-pre-wrap p-6 ${isXml || isJson ? 'text-cyan-100' : 'text-white text-sm'}`}>
                    {displayedContent}
                  </pre>
                </div>
              ) : (
                /* FALLBACK */
                <div className="text-center py-20 max-w-md px-4">
                  <div className="text-6xl mb-4">📎</div>
                  <p className="text-lg font-semibold text-white mb-2">Preview not available</p>
                  <p className="text-xs text-gray-500 mb-6">{file.filename} • {file.mimeType}</p>
                  <button onClick={handleDownload} className="glass-card px-6 py-3 text-green-400 hover:scale-105 transition">
                    <FaDownload className="inline mr-2" /> Download to view
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {textContent && (isXml || isJson) && (
          <div className="px-4 py-2 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs text-gray-400">
            <span>
              {isXml ? '📄 XML Document' : '📄 JSON Document'} • {textContent.length.toLocaleString()} characters
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