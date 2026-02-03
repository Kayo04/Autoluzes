import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { resend } from '@/lib/resend';
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal that the user doesn't exist for security reasons
            return NextResponse.json({ message: 'If an account exists, an email has been sent.' }, { status: 200 });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        // crypto.randomBytes is good, but let's just store the token directly for simplicity in this flow 
        // (in high security apps, hashing it would be better, but this is standard for OTP/Links often)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        try {
            await resend.emails.send({
                from: 'Autoluzes <onboarding@resend.dev>',
                to: user.email,
                subject: 'Reset Your Password',
                react: React.createElement(ResetPasswordEmail, {
                    resetLink,
                }),
            });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'If an account exists, an email has been sent.' }, { status: 200 });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
