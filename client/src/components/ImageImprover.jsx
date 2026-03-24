import { useState } from 'react';
import { Wand2, Loader2, Download, X, Image as ImageIcon } from 'lucide-react';
import { apiPost } from '../utils/api';

function compressAndConvert(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const base64 = dataUrl.split(',')[1];
      resolve({ data: base64, mediaType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageImprover({ platform, genre }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults(null);
  };

  const handleImprove = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const image = await compressAndConvert(file);
      const data = await apiPost('/audit/improve-image', {
        image,
        platform,
        description,
        genre,
      });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (base64, label) => {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${base64}`;
    a.download = `ReachRadar-${label.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Wand2 className="text-cyan-400" size={20} />
        AI Image Improver
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Upload your photo/thumbnail and AI will generate 4 improved versions you can download.
      </p>

      {!results && (
        <>
          <div className="flex gap-4 mb-4">
            <label className="flex-1 cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                preview ? 'border-cyan-400/30 bg-cyan-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}>
                {preview ? (
                  <div className="relative inline-block">
                    <img src={preview} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
                    <button
                      onClick={(e) => { e.preventDefault(); setFile(null); setPreview(''); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to upload your image</p>
                    <p className="text-xs text-gray-600">PNG, JPG, WEBP</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </label>
          </div>

          <textarea
            className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-300 placeholder:text-gray-600 focus:border-cyan-400 focus:outline-none transition resize-none mb-4"
            placeholder="Optional: Describe what this image is for (e.g., 'YouTube thumbnail for a cooking video', 'Instagram post about travel in Bali')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-400 mb-3">{error}</p>
          )}

          <button
            onClick={handleImprove}
            disabled={!file || loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating improved versions... (30-45 seconds)
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Improve My Image
              </>
            )}
          </button>
        </>
      )}

      {results && (
        <div>
          {results.analysis && (
            <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg">
              <p className="text-xs font-semibold text-cyan-400 mb-1">Image Analysis</p>
              <p className="text-sm text-gray-300">{results.analysis}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            {results.images?.map((img, i) => (
              <div key={i} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={img.imageUrl || `data:image/png;base64,${img.image}`}
                  alt={img.label}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-white mb-2">{img.label}</p>
                  <a
                    href={img.imageUrl || `data:image/png;base64,${img.image}`}
                    download={`ReachRadar-${img.label.replace(/\s+/g, '-')}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {results.images?.length === 0 && (
            <p className="text-sm text-red-400 text-center py-4">Could not generate improved images. Try again with a different photo.</p>
          )}

          <button
            onClick={() => { setResults(null); setFile(null); setPreview(''); }}
            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 transition"
          >
            Try Another Image
          </button>
        </div>
      )}
    </div>
  );
}
