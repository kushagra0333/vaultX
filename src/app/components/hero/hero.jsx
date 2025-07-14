"use client";
import { useState, useRef } from 'react';

// Supported file types and conversion targets
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
  jpg: { conversions: ["png", "webp", "bmp", "gif", "pdf"] },
  jpeg: { conversions: ["png", "webp", "bmp", "gif", "pdf"] },
  png: { conversions: ["jpg", "webp", "bmp", "gif", "pdf"] },
  gif: { conversions: ["jpg", "png", "webp", "bmp", "pdf"] },
  bmp: { conversions: ["jpg", "png", "webp", "gif", "pdf"] },
  webp: { conversions: ["jpg", "png", "bmp", "gif", "pdf"] },
  svg: { conversions: ["jpg", "png", "pdf"] },
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
  '7z': { conversions: ["zip", "tar", "gz"] },
  exe: { conversions: ["zip"] },
  dmg: { conversions: ["zip"] },
  sh: { conversions: ["txt"] },
  bat: { conversions: ["txt"] },
  py: { conversions: ["txt"] },
  js: { conversions: ["txt"] },
  json: { conversions: ["txt"] },
  xml: { conversions: ["txt"] },
  yml: { conversions: ["txt"] },
  yaml: { conversions: ["txt"] },
};

export default function FileConverter() {
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

    const ext = selectedFile.name.toLowerCase().split('.').pop();
    if (!fileTypes[ext]) {
      setError(`Unsupported file type: .${ext}`);
      return;
    }

    setFile(selectedFile);
    setInputType(ext);
    setOutputType(fileTypes[ext].conversions[0] || "");
    setProgress(0);
    setStatus("idle");
    setError(null);
  };

  const handleConvert = async () => {
    if (!file || !outputType) {
      setError("Please select a file and target format.");
      return;
    }

    setStatus("converting");
    setProgress(30);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetFormat", outputType);

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      setProgress(80);
      const blob = await res.blob();

      const contentDisposition = res.headers.get("Content-Disposition");
      let fileName = "converted_file";
      const match = contentDisposition?.match(/filename="?([^"]+)"?/);
      if (match) fileName = match[1];

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resetForm();
      }, 100);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
      setProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setInputType("");
    setOutputType("");
    setProgress(0);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-neutral-700">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Universal File Converter</h1>
            <p className="text-gray-400">Convert between hundreds of file formats with ease.</p>
          </div>

          <div className="space-y-6">
            {/* Upload section */}
            <div className="bg-[#222] p-4 rounded-lg border border-neutral-700">
              <label className="block text-sm font-medium mb-2">Upload File</label>
              <div className="flex gap-2 items-center">
                <label className="flex-1">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div className="w-full px-4 py-3 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-[#2a2a2a] transition flex items-center justify-center text-gray-300">
                    {file ? (
                      <span className="truncate">{file.name}</span>
                    ) : (
                      <span>Click to browse or drag and drop</span>
                    )}
                  </div>
                </label>
                {file && (
                  <button
                    onClick={resetForm}
                    className="px-4 py-3 bg-red-800 text-red-100 rounded-lg hover:bg-red-700 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              {file && (
                <div className="mt-2 flex justify-between text-sm text-gray-400">
                  <span>Type: .{inputType}</span>
                  <span>Size: {formatFileSize(file.size)}</span>
                </div>
              )}
            </div>

            {/* Format selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#222] p-4 rounded-lg border border-neutral-700">
                <label className="block text-sm font-medium mb-2">Source Format</label>
                <div className="px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-md">
                  {file ? `.${inputType}` : '--'}
                </div>
              </div>

              <div className="bg-[#222] p-4 rounded-lg border border-neutral-700">
                <label className="block text-sm font-medium mb-2">Target Format</label>
                <select
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={!file}
                >
                  {fileTypes[inputType]?.conversions?.map((format) => (
                    <option key={format} value={format}>
                      .{format}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress bar */}
            {status === "converting" && (
              <div className="bg-[#1a1a1a] border border-blue-700 p-4 rounded-lg">
                <div className="flex justify-between text-sm text-blue-400 mb-2">
                  <span>Conversion in progress...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-blue-900 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-900 border border-red-700 p-4 rounded-lg">
                <div className="text-red-300 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Convert button */}
            <button
              onClick={handleConvert}
              disabled={!file || status === "converting"}
              className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                !file || status === "converting"
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow"
              }`}
            >
              {status === "converting" ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </div>
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
