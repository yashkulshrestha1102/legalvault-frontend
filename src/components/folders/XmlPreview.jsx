import { useEffect, useState } from 'react';

export default function XmlPreview({ content }) {
  const [formatted, setFormatted] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'

  useEffect(() => {
    if (!content) return;
    
    try {
      // ✅ Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      // Check for parse errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid XML');
      }
      
      // ✅ Pretty-print XML
      const formatted = formatXml(content);
      setFormatted(formatted);
      setError(null);
    } catch (err) {
      setError('Could not parse XML. Showing raw content.');
      setFormatted(content);
    }
  }, [content]);

  // ✅ Format XML with indentation
  const formatXml = (xml) => {
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\n$2$3');
    let pad = 0;
    
    return formatted
      .split('\n')
      .map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1;
        }
        
        const padding = '  '.repeat(pad);
        pad += indent;
        return padding + node;
      })
      .join('\n');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex gap-2 p-3 border-b border-white/10 bg-black/20">
        <button
          onClick={() => setViewMode('formatted')}
          className={`px-3 py-1 text-xs rounded transition ${
            viewMode === 'formatted'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40'
              : 'glass-card text-gray-400'
          }`}
        >
          🌳 Formatted
        </button>
        <button
          onClick={() => setViewMode('raw')}
          className={`px-3 py-1 text-xs rounded transition ${
            viewMode === 'raw'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40'
              : 'glass-card text-gray-400'
          }`}
        >
          📄 Raw
        </button>
        
        {error && (
          <span className="text-xs text-yellow-400 ml-auto">⚠️ {error}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono text-cyan-100 whitespace-pre-wrap">
          {viewMode === 'formatted' ? formatted : content}
        </pre>
      </div>
    </div>
  );
}