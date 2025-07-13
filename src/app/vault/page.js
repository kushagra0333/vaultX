"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header/header";
import { formatBytes, formatDate } from "@/utils/format";
import { FiDownload, FiTrash2, FiShare2, FiCopy, FiCheck } from "react-icons/fi";

export default function VaultPage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareStates, setShareStates] = useState({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("vault_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchFiles();
    // eslint-disable-next-line
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vault/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vault_token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch files");
      setFiles(data.files || []);
      setShareStates({});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/vault/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vault_token")}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      fetchFiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/vault/download?id=${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vault_token")}`,
        },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const response = await fetch("/api/vault/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vault_token")}`,
        },
        body: JSON.stringify({ fileId }),
      });
      if (!response.ok) throw new Error("Delete failed");
      fetchFiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShare = async (fileId) => {
    try {
      const response = await fetch("/api/vault/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vault_token")}`,
        },
        body: JSON.stringify({ fileId }),
      });
      if (!response.ok) throw new Error("Share failed");
      const { shareUrl } = await response.json();

      setShareStates(prev => ({
        ...prev,
        [fileId]: {
          url: shareUrl,
          copied: false
        }
      }));

      await navigator.clipboard.writeText(shareUrl);
      setShareStates(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          copied: true
        }
      }));

      setTimeout(() => {
        setShareStates(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] via-[#232323] to-[#121212] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white drop-shadow">My Vault</h1>
              <p className="text-neutral-400 text-lg">Your secure, private cloud for every file type.</p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                id="file-upload"
                type="file"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    handleUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-purple-500 cursor-pointer transition-colors font-semibold"
              >
                Upload File
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 font-bold text-lg"
              >
                ×
              </button>
            </div>
          )}

          <div className="bg-[#181818]/80 rounded-2xl shadow-xl border border-neutral-800 p-6">
            {isLoading && files.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 animate-pulse">Loading your files...</div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                No files uploaded yet. Click <span className="text-blue-400 font-semibold">Upload File</span> to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="bg-[#232323]/80 rounded-xl shadow-lg border border-neutral-700 p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow">
                          {file.fileExtension?.toUpperCase() || "?"}
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-semibold text-white truncate max-w-[140px]">
                            {file.fileName}
                          </div>
                          <div className="text-xs text-neutral-400">
                            .{file.fileExtension}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-neutral-400 mb-1">
                        Type: <span className="text-white">{file.fileType || "Unknown"}</span>
                      </div>
                      <div className="text-sm text-neutral-400 mb-1">
                        Size: <span className="text-white">{formatBytes(file.fileSize)}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mb-2">
                        Uploaded: {formatDate(file.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => handleDownload(file._id, file.fileName)}
                          className="p-2 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-200 transition"
                          title="Download"
                        >
                          <FiDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleShare(file._id)}
                          className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 hover:text-purple-200 transition"
                          title="Share"
                        >
                          <FiShare2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(file._id)}
                          className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-200 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      {shareStates[file._id] && (
                        <div className="mt-3 flex items-center bg-[#232323] p-2 rounded text-xs">
                          <span className="text-neutral-200 truncate mr-2">
                            {shareStates[file._id].url}
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(shareStates[file._id].url)}
                            className="text-neutral-400 hover:text-neutral-200"
                          >
                            {shareStates[file._id].copied ? (
                              <FiCheck size={14} className="text-green-400" />
                            ) : (
                              <FiCopy size={14} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}