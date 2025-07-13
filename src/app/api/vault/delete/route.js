// app/api/vault/delete/route.js
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const user = verifyToken(token);
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { fileId } = await req.json();
    
    if (!fileId) {
      return new Response('File ID required', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('files').deleteOne({ 
      _id: new ObjectId(fileId),
      userId: user.userId 
    });

    if (result.deletedCount === 0) {
      return new Response('File not found or unauthorized', { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}