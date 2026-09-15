// src/utils/downloadHelper.js
import api from './api';

/**
 * Download a file with progress tracking + long timeout
 */
export const downloadWithProgress = async ({
  url,
  filename = 'download',
  onProgress = null,
  timeout = 600000,  // 10 minutes default
  params = {},
}) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
      timeout,
      params,
      onDownloadProgress: (e) => {
        if (e.total && onProgress) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent, e.loaded, e.total);
        }
      },
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup after 60s (for large files)
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 60000);
    
    return { success: true };
  } catch (err) {
    // Better error messages
    let message = 'Download failed';
    if (err.code === 'ECONNABORTED') {
      message = 'Download timeout — file may be too large';
    } else if (err.response?.status === 404) {
      message = 'File not found';
    } else if (err.response?.status === 403) {
      message = 'Access denied';
    } else if (err.response?.status === 500) {
      message = 'Server error during download';
    } else if (err.message) {
      message = err.message;
    }
    
    return { success: false, error: message };
  }
};