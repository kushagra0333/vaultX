import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import mammoth from 'mammoth';
import { convert } from 'html-to-text';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Supported conversions mapping
const conversionTools = {
  // Document conversions
  'docx-to-pdf': 'libreoffice --headless --convert-to pdf',
  'odt-to-pdf': 'libreoffice --headless --convert-to pdf',
  'rtf-to-pdf': 'libreoffice --headless --convert-to pdf',
  'html-to-pdf': 'wkhtmltopdf',
  'epub-to-pdf': 'ebook-convert',
  
  // Image conversions
  'jpg-to-png': 'convert',
  'png-to-jpg': 'convert',
  'webp-to-png': 'convert',
  'bmp-to-png': 'convert',
  'gif-to-png': 'convert',
  
  // Audio conversions
  'mp3-to-wav': 'ffmpeg -i',
  'wav-to-mp3': 'ffmpeg -i',
  'ogg-to-mp3': 'ffmpeg -i',
  'aac-to-mp3': 'ffmpeg -i',
  'flac-to-mp3': 'ffmpeg -i',
  
  // Video conversions
  'mp4-to-mov': 'ffmpeg -i',
  'mov-to-mp4': 'ffmpeg -i',
  'avi-to-mp4': 'ffmpeg -i',
  'webm-to-mp4': 'ffmpeg -i',
  'mkv-to-mp4': 'ffmpeg -i',
  
  // Archive conversions
  'zip-to-tar': 'tar -cf',
  'tar-to-zip': 'zip -r',
  'gz-to-zip': 'gunzip -c | zip',
  '7z-to-zip': '7z x -so | zip',
};

const mimeTypes = {
  // Documents
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  epub: 'application/epub+zip',
  
  // Spreadsheets
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  
  // Presentations
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odp: 'application/vnd.oasis.opendocument.presentation',
  
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
  
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  
  // Video
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  
  // Archives
  zip: 'application/zip',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  '7z': 'application/x-7z-compressed',
  rar: 'application/x-rar-compressed',
  
  // Executables
  exe: 'application/vnd.microsoft.portable-executable',
  dmg: 'application/x-apple-diskimage',
  pkg: 'application/x-newton-compatible-pkg',
  deb: 'application/vnd.debian.binary-package',
  rpm: 'application/x-rpm',
  
  // Scripts
  sh: 'application/x-sh',
  bat: 'application/x-msdownload',
  ps1: 'application/postscript',
  
  // Code
  py: 'text/x-python',
  js: 'application/javascript',
  json: 'application/json',
  xml: 'application/xml',
  yml: 'application/x-yaml',
  yaml: 'application/x-yaml',
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const targetFormat = formData.get('targetFormat');

    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: "Missing file or target format" }, 
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const originalExt = fileName.split('.').pop();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temp directory
    const tempDir = await fs.mkdtemp(join(tmpdir(), 'convert-'));
    const inputPath = join(tempDir, `input.${originalExt}`);
    const outputPath = join(tempDir, `output.${targetFormat}`);

    // Write input file
    await fs.writeFile(inputPath, buffer);

    // Handle different conversion types
    let outputBuffer;
    
    // 1. Document to PDF conversions
    if (targetFormat === 'pdf') {
      if (originalExt === 'docx') {
        // Convert DOCX to PDF using mammoth (simple HTML conversion)
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
        const html = result.value;
        const text = convert(html);
        
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        page.drawText(text, {
          x: 50,
          y: 750,
          size: 12,
          color: rgb(0, 0, 0),
        });
        outputBuffer = await pdfDoc.save();
      }
      else if (originalExt === 'txt' || originalExt === 'md') {
        // Convert text to PDF
        const text = buffer.toString('utf-8');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        page.drawText(text, {
          x: 50,
          y: 750,
          size: 12,
          color: rgb(0, 0, 0),
        });
        outputBuffer = await pdfDoc.save();
      }
      else if (['jpg', 'jpeg', 'png'].includes(originalExt)) {
        // Convert image to PDF
        const pdfDoc = await PDFDocument.create();
        let image;
        
        if (originalExt === 'jpg' || originalExt === 'jpeg') {
          image = await pdfDoc.embedJpg(bytes);
        } else if (originalExt === 'png') {
          image = await pdfDoc.embedPng(bytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
        outputBuffer = await pdfDoc.save();
      }
      else {
        // Use LibreOffice for other document types (odt, rtf, etc.)
        try {
          await execAsync(`libreoffice --headless --convert-to pdf --outdir ${tempDir} ${inputPath}`);
          outputBuffer = await fs.readFile(join(tempDir, `input.pdf`));
        } catch (err) {
          console.error('LibreOffice conversion error:', err);
          throw new Error('Document conversion failed');
        }
      }
    }
    // 2. Image conversions
    else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(originalExt) && 
             ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(targetFormat)) {
      try {
        await execAsync(`convert ${inputPath} ${outputPath}`);
        outputBuffer = await fs.readFile(outputPath);
      } catch (err) {
        console.error('Image conversion error:', err);
        throw new Error('Image conversion failed');
      }
    }
    // 3. Audio conversions
    else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(originalExt) && 
             ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(targetFormat)) {
      try {
        await execAsync(`ffmpeg -i ${inputPath} ${outputPath}`);
        outputBuffer = await fs.readFile(outputPath);
      } catch (err) {
        console.error('Audio conversion error:', err);
        throw new Error('Audio conversion failed');
      }
    }
    // 4. Video conversions
    else if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(originalExt) && 
             ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(targetFormat)) {
      try {
        await execAsync(`ffmpeg -i ${inputPath} ${outputPath}`);
        outputBuffer = await fs.readFile(outputPath);
      } catch (err) {
        console.error('Video conversion error:', err);
        throw new Error('Video conversion failed');
      }
    }
    // 5. Archive conversions
    else if (['zip', 'tar', 'gz', '7z'].includes(originalExt) && 
             ['zip', 'tar', 'gz', '7z'].includes(targetFormat)) {
      try {
        if (originalExt === 'zip' && targetFormat === 'tar') {
          await execAsync(`unzip ${inputPath} -d ${tempDir}/extracted && tar -cf ${outputPath} -C ${tempDir}/extracted .`);
        } else if (originalExt === 'tar' && targetFormat === 'zip') {
          await execAsync(`tar -xf ${inputPath} -C ${tempDir}/extracted && zip -r ${outputPath} ${tempDir}/extracted`);
        } else {
          throw new Error('Unsupported archive conversion');
        }
        outputBuffer = await fs.readFile(outputPath);
      } catch (err) {
        console.error('Archive conversion error:', err);
        throw new Error('Archive conversion failed');
      }
    }
    else {
      throw new Error('Conversion not supported');
    }

    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true });

    // Return converted file
    const outFileName = `${fileName.split('.')[0]}.${targetFormat}`;
    return new Response(outputBuffer, {
      headers: {
        "Content-Type": mimeTypes[targetFormat] || 'application/octet-stream',
        "Content-Disposition": `attachment; filename="${outFileName}"`,
      },
    });

  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Conversion failed" },
      { status: 500 }
    );
  }
}