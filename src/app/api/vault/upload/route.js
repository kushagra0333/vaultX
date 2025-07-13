import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateShareToken } from '@/lib/storage';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const fileExtension = fileName.split('.').pop();
    const shareToken = generateShareToken();

    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('files').insertOne({
      userId: user.userId,
      fileName,
      fileType,
      fileSize,
      fileExtension,
      shareToken,
      buffer: Buffer.from(buffer),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}