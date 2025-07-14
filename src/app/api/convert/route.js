import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

function getMimeType(ext) {
  const types = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    odt: 'application/vnd.oasis.opendocument.text',
    rtf: 'application/rtf',
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    epub: 'application/epub+zip',
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    odp: 'application/vnd.oasis.opendocument.presentation',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    "7z": 'application/x-7z-compressed',
    exe: 'application/vnd.microsoft.portable-executable',
    dmg: 'application/x-apple-diskimage',
    sh: 'application/x-sh',
    py: 'text/x-python',
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
    // Add more as needed
  };
  return types[ext] || 'application/octet-stream';
}

function isForbiddenConversion(from, to) {
  // Prevent video to image, image to video, etc.
  const videoTypes = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  if (videoTypes.includes(from) && imageTypes.includes(to)) return true;
  if (imageTypes.includes(from) && videoTypes.includes(to)) return true;
  return false;
}
