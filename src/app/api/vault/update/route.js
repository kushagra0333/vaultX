// app/api/auth/update/route.js
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const user = verifyToken(token);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, username } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    // Check if email is already taken by another user
    const existingUser = await db.collection('users').findOne({ 
      email, 
      _id: { $ne: new ObjectId(user.userId) } 
    });
    if (existingUser) {
      return Response.json({ error: 'Email already in use' }, { status: 400 });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(user.userId) },
      { $set: { email, username, updatedAt: new Date() } }
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}