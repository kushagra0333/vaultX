"use client";
import { useState, useRef } from 'react';

// Broad file type support
const fileTypes = {
  pdf: { conversions: ["docx", "txt", "odt", "rtf", "html", "epub"] },
  docx: { conversions: ["pdf", "txt", "odt", "rtf", "html", "epub"] },
  odt: { conversions: ["pdf", "docx", "txt", "rtf", "html"] },
  rtf: { conversions: ["pdf", "docx", "txt", "odt", "html"] },
  txt: { conversions: ["pdf", "docx", "odt", "rtf", "html", "md"] },
  md: { conversions: ["pdf", "docx", "txt", "html"] },
  html: { conversions: ["pdf", "docx", "txt", "md"] },
  epub: { conversions: ["pdf", "docx", "txt"] },
  csv: { conversions: ["pdf", "xlsx", "ods"] },
  xlsx: { conversions: ["pdf", "csv", "ods"] },
  ods: { conversions: ["pdf", "csv", "xlsx"] },
  pptx: { conversions: ["pdf", "odp"] },
  odp: { conversions: ["pdf", "pptx"] },
  jpg: { conversions: ["jpeg", "png", "webp", "bmp", "gif", "pdf"] },
  jpeg: { conversions: ["jpg", "png", "webp", "bmp", "gif", "pdf"] },
  png: { conversions: ["jpg", "jpeg", "webp", "bmp", "gif", "pdf"] },
  gif: { conversions: ["jpg", "jpeg", "png", "webp", "bmp", "pdf"] },
  bmp: { conversions: ["jpg", "jpeg", "png", "webp", "gif", "pdf"] },
  webp: { conversions: ["jpg", "jpeg", "png", "bmp", "gif", "pdf"] },
  mp3: { conversions: ["wav", "ogg", "aac", "flac"] },
  wav: { conversions: ["mp3", "ogg", "aac", "flac"] },
  ogg: { conversions: ["mp3", "wav", "aac", "flac"] },
  aac: { conversions: ["mp3", "wav", "ogg", "flac"] },
  flac: { conversions: ["mp3", "wav", "ogg", "aac"] },
  mp4: { conversions: ["mov", "avi", "webm", "mkv"] },
  mov: { conversions: ["mp4", "avi", "webm", "mkv"] },
  avi: { conversions: ["mp4", "mov", "webm", "mkv"] },
  webm: { conversions: ["mp4", "mov", "avi", "mkv"] },
  mkv: { conversions: ["mp4", "mov", "avi", "webm"] },
  zip: { conversions: ["tar", "gz", "7z"] },
  tar: { conversions: ["zip", "gz", "7z"] },
  gz: { conversions: ["zip", "tar", "7z"] },
  "7z": { conversions: ["zip", "tar", "gz"] },
  exe: { conversions: ["zip"] },
  dmg: { conversions: ["zip"] },
  sh: { conversions: ["txt"] },
  py: { conversions: ["txt"] },
  js: { conversions: ["txt"] },
  json: { conversions: ["txt"] },
  xml: { conversions: ["txt"] },
  // Add more as needed
};

export default function Hero() {
  const [file, setFile] = useState(null);
  const [inputType, setInputType] = useState("");
  const [outputType, setOutputType] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const ext = fileName.split('.').pop();

    if (!fileTypes[ext]) {
      setError(
        `.${ext} files are not supported. Supported types: ${Object.keys(fileTypes)
          .map(t => '.' + t)
          .join(', ')}`
      );
      return;
    }

    setFile(selectedFile);
    setInputType(ext);
    setError(null);
    setProgress(0);
    setStatus("idle");

    if (fileTypes[ext]?.conversions?.length > 0) {
      setOutputType(fileTypes[ext].conversions[0]);
    } else {
      setOutputType(""); // No conversion available
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    if (!outputType) {
      setError("Please select a target format");
      return;
    }

    setStatus("converting");
    setError(null);
    setProgress(30);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', outputType);

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Conversion failed. Please try again.");
      }

      setProgress(80);

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let fileName = "converted_file";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) fileName = match[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      setProgress(100);
      setStatus("done");
    } catch (err) {
      setError(err.message || "Conversion failed. Please try again.");
      setStatus("idle");
      setProgress(0);
    }
  };

  const getOutputOptions = () => {
    if (!fileTypes[inputType]) return [];
    return fileTypes[inputType].conversions || [];
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-[#1e1e1e] p-6 rounded-xl border border-neutral-800 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">File Converter</h2>
            <p className="text-neutral-400">Convert files between almost any format</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-neutral-300 mb-2 font-medium">
                Upload File
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    ref={fileInputRef}
                  />
                  <div className="w-full bg-[#252525] hover:bg-[#2a2a2a] text-white border border-neutral-700 p-3 rounded-lg transition-colors duration-200">
                    {file ? file.name : "Choose a file"}
                  </div>
                </label>
                {file && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setError(null);
                      setStatus("idle");
                      setProgress(0);
                      setInputType("");
                      setOutputType("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              {file && (
                <div className="mt-2 text-sm text-neutral-400">
                  <p>Type: .{inputType} • Size: {formatFileSize(file.size)}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-neutral-300 mb-2 font-medium">
                  Convert From
                </label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full bg-[#252525] text-white border border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={!file}
                >
                  {file && (
                    <option value={inputType}>.{inputType} (original)</option>
                  )}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-neutral-300 mb-2 font-medium">
                  Convert To
                </label>
                <select
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value)}
                  className="w-full bg-[#252525] text-white border border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={!file}
                >
                  {getOutputOptions().map(type => (
                    <option key={type} value={type}>.{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {status !== "idle" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>
                    {status === "converting" ? "Converting..." : "Downloading..."}
                  </span>
                  <span>
                    {progress}% complete
                  </span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                {error}
              </div>
            )}
            {status === "done" && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg">
                Conversion complete! Your file has been downloaded.
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={!file || status !== "idle" || !outputType}
              className={`w-full ${
                !file || status !== "idle" || !outputType
                  ? "bg-neutral-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              } text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2`}
            >
              {status === "converting" ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l5-5-5-5v4C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Converting...
                </>
              ) : (
                "Convert File"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}