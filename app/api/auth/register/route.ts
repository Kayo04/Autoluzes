import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validation';
import crypto from 'crypto';
import { resend } from '@/lib/resend';
import VerificationEmail from '@/components/emails/VerificationEmail';
import React from 'react';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        await dbConnect();

        // Rate Limiting: 30 registrations per hour per IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(
            ip,
            'register',
            30,
            60 * 60 * 1000 // 1 hour
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many registration attempts. Please try again later.',
                    retryAfter: rateLimitResult.resetAt
                },
                { status: 429 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Generate 6-digit verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create user
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email.toLowerCase(),
            password: hashedPassword,
            locale: 'pt', // Default to Portuguese
            isVerified: false,
            verificationCode,
            verificationCodeExpires,
        });

        // Send verification email
        try {
            await resend.emails.send({
                from: 'Autoluzes <onboarding@resend.dev>',
                to: user.email,
                subject: 'Confirm your Autoluzes account',
                react: React.createElement(VerificationEmail, {
                    validationCode: verificationCode,
                }),
            });
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // We still return success, but client should handle resend logic if needed
        }

        return NextResponse.json(
            {
                message: 'User created successfully. Please verify your email.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                requiresVerification: true,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
