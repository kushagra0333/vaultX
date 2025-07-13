import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const files = await db.collection('files')
      .find({ userId: user.userId })
      .project({ buffer: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}