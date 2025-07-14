import clientPromise from '@/lib/mongodb';
import { generateOTP } from '@/utils/auth';
import { sendEmail } from '@/utils/email';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    await db.collection('verifications').updateOne(
      { email },
      { $set: { otp, createdAt: new Date() } },
      { upsert: true }
    );

    // Send OTP via email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Your VaultX Verification Code',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your VaultX verification code is: <strong>${otp}</strong></p>`
    });

    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OTP Request Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}