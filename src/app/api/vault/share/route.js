// app/api/vault/share/route.js
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import { generateShareToken } from '@/lib/storage';

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
    
    // Generate new share token
    const shareToken = generateShareToken();
    
    // Update the file with share token
    await db.collection('files').updateOne(
      { _id: new ObjectId(fileId), userId: user.userId },
      { $set: { shareToken, updatedAt: new Date() } }
    );

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${shareToken}`;
    
    return new Response(JSON.stringify({ shareUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}