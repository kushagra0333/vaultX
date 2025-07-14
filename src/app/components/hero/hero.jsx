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
   <div className="min-h-screen bg-[#111] text-white">
  <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-800">
      
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Universal File Converter</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Convert between hundreds of file formats with ease.
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-6 bg-[#222] p-4 sm:p-5 rounded-lg border border-neutral-700">
        <label className="block text-sm font-medium mb-3">Upload File</label>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <div className="w-full px-4 py-3 border-2 border-dashed border-gray-500 rounded-lg hover:bg-[#2a2a2a] transition text-gray-300 text-center truncate">
              {file ? (
                <span>{file.name}</span>
              ) : (
                <span>Click to browse or drag and drop</span>
              )}
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
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-4 py-2 bg-red-800 text-red-100 rounded-lg hover:bg-red-700 transition text-sm"
            >
              Clear
            </button>
          )}
        </div>
        {file && (
          <div className="mt-3 flex flex-col sm:flex-row justify-between text-sm text-gray-400">
            <span>Type: .{inputType}</span>
            <span>Size: {formatFileSize(file.size)}</span>
          </div>
        )}
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-[#222] p-4 rounded-lg border border-neutral-700">
          <label className="block text-sm font-medium mb-2">Source Format</label>
          <div className="px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-gray-300 text-sm">
            {file ? `.${inputType}` : '--'}
          </div>
        </div>

        <div className="bg-[#222] p-4 rounded-lg border border-neutral-700">
          <label className="block text-sm font-medium mb-2">Target Format</label>
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value)}
            disabled={!file}
            className="w-full px-3 py-2 bg-[#1a1a1a] text-white border border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {fileTypes[inputType]?.conversions?.map((format) => (
              <option key={format} value={format}>
                .{format}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      {status === "converting" && (
        <div className="mb-6 bg-[#1a1a1a] border border-blue-700 p-4 rounded-lg">
          <div className="flex justify-between text-sm text-blue-400 mb-2">
            <span>Conversion in progress...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-900 border border-red-700 p-4 rounded-lg text-sm">
          <div className="text-red-300 flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Success */}
      {status === "done" && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">
          Conversion complete! Your file has been downloaded.
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!file || status === "converting" || !outputType}
        className={`w-full py-3 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
          !file || status === "converting" || !outputType
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow"
        } flex items-center justify-center gap-2`}
      >
        {status === "converting" ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Converting...
          </>
        ) : (
          "Convert File"
        )}
      </button>
    </div>
  </main>
</div>

  );
}