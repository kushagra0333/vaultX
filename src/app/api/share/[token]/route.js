// app/api/share/[token]/route.js
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { token } = params;
    const client = await clientPromise;
    const db = client.db();
    const file = await db.collection('files').findOne({ shareToken: token });

    if (!file) {
      return new Response('File not found or link expired', { status: 404 });
    }

    return new Response(file.buffer.buffer, {
      headers: {
        'Content-Type': file.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.fileName}"`,
        'Content-Length': file.fileSize
      }
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}