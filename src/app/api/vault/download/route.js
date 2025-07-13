// app/api/vault/download/route.js
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('id');
    
    if (!fileId) {
      return new Response('File ID required', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const file = await db.collection('files').findOne({ 
      _id: new ObjectId(fileId) 
    });

    if (!file) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(file.buffer.buffer, {
      headers: {
        'Content-Type': file.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
        'Content-Length': file.fileSize
      }
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}