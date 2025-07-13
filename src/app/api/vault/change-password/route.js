// app/api/auth/change-password/route.js
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const user = verifyToken(token);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    // Verify current password
    const userData = await db.collection('users').findOne({ 
      _id: new ObjectId(user.userId) 
    });
    
    const valid = await bcrypt.compare(currentPassword, userData.password);
    if (!valid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(
      { _id: new ObjectId(user.userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}