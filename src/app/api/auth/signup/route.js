// filepath: [route.js](http://_vscodecontentref_/4)
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/auth';

export async function POST(req) {
  try {
    const { email, username, password, otp } = await req.json();

    if (!email || !username || !password || !otp) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Verify OTP
    const verification = await db.collection('verifications').findOne({ email });
    if (!verification || verification.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.collection('users').insertOne({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Remove used OTP
    await db.collection('verifications').deleteOne({ email });

    const token = signToken({
      email,
      userId: result.insertedId.toString(),
      username
    });

    return NextResponse.json({
      token,
      user: {
        email,
        username,
        createdAt: new Date()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}