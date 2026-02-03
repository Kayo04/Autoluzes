import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and valid code are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Rate Limiting: 5 verification attempts per 15 minutes per IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(
            ip,
            'verify_code',
            5,
            15 * 60 * 1000 // 15 minutes
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many verification attempts. Please try again later.',
                    retryAfter: rateLimitResult.resetAt
                },
                { status: 429 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' });
        }

        // Check verification code
        if (
            user.verificationCode !== code ||
            !user.verificationCodeExpires ||
            new Date() > user.verificationCodeExpires
        ) {
            return NextResponse.json(
                { error: 'Invalid or expired verification code' },
                { status: 400 }
            );
        }

        // Activate user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
