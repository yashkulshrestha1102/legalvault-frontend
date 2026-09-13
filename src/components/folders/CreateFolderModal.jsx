import { useState, useEffect } from 'react';
import { FaTimes, FaFolderPlus } from 'react-icons/fa';

export default function CreateFolderModal({ open, onClose, onCreate, parentName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Folder name is required');
      return;
    }
    if (trimmed.length > 100) {
      setError('Folder name is too long (max 100 chars)');
      return;
    }
    // Windows/Unix filesystem safety
    if (/[<>:"/\\|?*\x00-\x1F]/.test(trimmed)) {
      setError('Name contains invalid characters');
      return;
    }

    setLoading(true);
    try {
      await onCreate(trimmed);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass w-full max-w-md p-6 rounded-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="glass-icon text-cyan-400">
            <FaFolderPlus />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create New Folder</h2>
            {parentName && (
              <p className="text-xs text-gray-400 mt-0.5">
                Inside: <span className="text-cyan-400">{parentName}</span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Folder Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Legal Documents, 2024"
              autoFocus
              className={`w-full glass-card p-3 outline-none text-white ${
                error ? 'border-2 border-red-500' : ''
              }`}
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="glass-card px-6 py-3 blue-glow hover:scale-105 transition disabled:opacity-50 flex-1"
            >
              {loading ? '⏳ Creating...' : '➕ Create Folder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="glass-card px-6 py-3 hover:scale-105 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}