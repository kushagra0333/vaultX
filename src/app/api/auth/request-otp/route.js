import clientPromise from '@/lib/mongodb';
import { generateOTP } from '@/utils/auth'; // <-- Correct path!
import { sendEmail } from '@/utils/email';

export async function POST(req) {
  try {
    const { email } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 400 });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await db.collection('verifications').updateOne(
      { email },
      { $set: { otp, createdAt: new Date() } },
      { upsert: true }
    );

    // Send email
    await sendEmail({
      to: email,
      subject: 'Your VaultX Verification Code',
      text: `Your verification code is: ${otp}`
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}