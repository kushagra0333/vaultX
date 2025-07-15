import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import libre from 'libreoffice-convert';
import { execSync } from 'child_process';

// Promisify LibreOffice convert
libre.convertAsync = require('util').promisify(libre.convert);

function getMimeType(ext) {
  const types = {
    pdf: 'application/pdf',
    doc: 'application/msword',
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
    rar: 'application/vnd.rar',
  };
  return types[ext] || 'application/octet-stream';
}

function isForbiddenConversion(from, to) {
  const videoTypes = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  if (videoTypes.includes(from) && imageTypes.includes(to)) return true;
  if (imageTypes.includes(from) && videoTypes.includes(to)) return true;
  return false;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const targetFormat = formData.get('targetFormat');

    if (!file || !targetFormat) {
      return NextResponse.json({ error: "Missing file or target format" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const originalExt = fileName.split('.').pop();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let convertedBuffer = buffer;
    let outFileName = `${fileName.split('.')[0]}_converted.${targetFormat}`;
    let mimeType = getMimeType(targetFormat);

    if (isForbiddenConversion(originalExt, targetFormat)) {
      return NextResponse.json({ error: "This conversion is not allowed." }, { status: 400 });
    }

    // Office to PDF conversion (DOCX, DOC, ODT, etc.)
    const officeExtensions = ['doc', 'docx', 'odt', 'rtf'];
    if (officeExtensions.includes(originalExt) && targetFormat === 'pdf') {
      const tempDir = tmpdir();
      const inputPath = join(tempDir, `input.${originalExt}`);
      const outputPath = join(tempDir, 'output.pdf');

      await fs.writeFile(inputPath, buffer);

      try {
        // Method 1: Try LibreOffice CLI first (most reliable)
        const command = `libreoffice --headless --convert-to pdf ${inputPath} --outdir ${tempDir}`;
        execSync(command, { stdio: 'ignore' });
        
        // Fallback to programmatic conversion if needed
        if (!await fs.access(outputPath).then(() => true).catch(() => false)) {
          console.log('Falling back to programmatic conversion');
          convertedBuffer = await libre.convertAsync(buffer, '.pdf', undefined);
        } else {
          convertedBuffer = await fs.readFile(outputPath);
        }
      } catch (error) {
        console.error('Office conversion error:', error);
        throw new Error('Failed to convert document to PDF');
      } finally {
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
      }
    }
    // Image to PDF conversion
    else if (['jpg', 'jpeg', 'png'].includes(originalExt) && targetFormat === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      let image;
      
      if (originalExt === 'png') {
        image = await pdfDoc.embedPng(bytes);
      } else if (originalExt === 'jpg' || originalExt === 'jpeg') {
        image = await pdfDoc.embedJpg(bytes);
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      
      convertedBuffer = await pdfDoc.save();
    }
    // Text to PDF conversion
    else if (originalExt === 'txt' && targetFormat === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const text = buffer.toString();
      page.drawText(text, { x: 50, y: 750, size: 12 });
      convertedBuffer = await pdfDoc.save();
    }

    return new Response(convertedBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${outFileName}"`,
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: error.message || "Conversion failed. Please ensure LibreOffice is installed for document conversions." },
      { status: 500 }
    );
  }
}